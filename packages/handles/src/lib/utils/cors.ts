import type { RequestHandler } from '@sveltejs/kit'
import { append } from 'vary'

import { isOriginAllowed, type AllowedOrigin } from './origins.js'

export interface CorsOptions {
  /**
   * If `true`, reflects request origin in `Access-Control-Allow-Origin`. If set to `*` or a
   * specific origin, sets `Access-Control-Allow-Origin` to that value. If a RegExp or an array of
   * strings/RegExps, reflects the request origin in `Access-Control-Allow-Origin` if it matches any
   * of the strings / RegExps provided. If explicitly set to `false` or `undefined`, does not set
   * the `Access-Control-Allow-Origin` header.
   * @default '*'
   */
  origin?: AllowedOrigin | undefined
  /**
   * Sets `Access-Control-Allow-Methods` to the given string or array of strings (joined with `,`).
   * If explicitly set to `undefined`, does not set the `Access-Control-Allow-Methods` header.
   * @default 'GET,HEAD,PUT,PATCH,POST,DELETE'
   */
  methods?: string | string[] | undefined
  /**
   * Sets `Access-Control-Allow-Headers` to the given string or array of strings (joined with `,`).
   * If set to `true`, reflects the `Access-Control-Request-Headers` header. If explicitly set to
   * `false`, or `undefined`, does not set the `Access-Control-Allow-Headers` header.
   * @default true
   */
  allowedHeaders?: string | string[] | boolean | undefined
  /**
   * Sets `Access-Control-Expose-Headers` to the given string or array of strings (joined with `,`).
   * If not specified, does not set `Access-Control-Expose-Headers`.
   */
  exposedHeaders?: string | string[] | undefined
  /**
   * Sets `Access-Control-Allow-Credentials` to `true` if `true`, or unset if `false`.
   * @default false
   */
  credentials?: boolean | undefined
  /**
   * Sets `Access-Control-Max-Age` to the given number. If unset, does not set
   * `Access-Control-Max-Age`.
   */
  maxAge?: number | undefined
  /**
   * If set, returns the given status code for preflight requests. If unset, returns 204. Useful for
   * clients that fail if an OPTIONS request returns 204 (mostly legacy browsers).
   * @default 204
   */
  optionsStatusSuccess?: number | undefined
}

type ConfiguredHeaders = Array<[string, string]>

function configureOrigin({ origin }: CorsOptions, req: Request): ConfiguredHeaders {
  const requestOrigin = req.headers.get('Origin')
  if (origin == null || origin === false) {
    return []
  }
  if (typeof origin === 'string') {
    return [['Access-Control-Allow-Origin', origin]]
  }
  const isAllowed = requestOrigin != null && isOriginAllowed(requestOrigin, origin)
  if (isAllowed) {
    return [
      ['Access-Control-Allow-Origin', requestOrigin],
      ['Vary', 'Origin'],
    ]
  }
  return [['Vary', 'Origin']]
}

function configureMethods({ methods }: CorsOptions): ConfiguredHeaders {
  if (methods == null) {
    return []
  }
  return [['Access-Control-Allow-Methods', Array.isArray(methods) ? methods.join(',') : methods]]
}

function configureCredentials({ credentials }: CorsOptions): ConfiguredHeaders {
  if (credentials) {
    return [['Access-Control-Allow-Credentials', 'true']]
  }
  return []
}

function configureAllowedHeaders({ allowedHeaders }: CorsOptions, req: Request): ConfiguredHeaders {
  if (allowedHeaders === true) {
    // reflect request headers
    const requestHeaders = req.headers.get('Access-Control-Request-Headers')
    if (requestHeaders) {
      return [
        ['Access-Control-Allow-Headers', requestHeaders],
        ['Vary', 'Access-Control-Request-Headers'],
      ]
    }
    return []
  }
  if (allowedHeaders == null || allowedHeaders === false) {
    return []
  }
  return [
    [
      'Access-Control-Allow-Headers',
      Array.isArray(allowedHeaders) ? allowedHeaders.join(',') : allowedHeaders,
    ],
  ]
}

function configureExposedHeaders({ exposedHeaders }: CorsOptions): ConfiguredHeaders {
  if (exposedHeaders == null) {
    return []
  }
  return [
    [
      'Access-Control-Expose-Headers',
      Array.isArray(exposedHeaders) ? exposedHeaders.join(',') : exposedHeaders,
    ],
  ]
}

function configureMaxAge({ maxAge }: CorsOptions): ConfiguredHeaders {
  if (maxAge == null) {
    return []
  }
  return [['Access-Control-Max-Age', String(maxAge)]]
}

function applyHeaders(headers: ConfiguredHeaders, response: Response): Response {
  const varyHeaderFields = []
  for (const [name, value] of headers) {
    if (name === 'Vary') {
      varyHeaderFields.push(value)
    } else {
      response.headers.set(name, value)
    }
  }
  if (varyHeaderFields.length > 0) {
    const varyHeader = append(response.headers.get('Vary') ?? '', varyHeaderFields)
    if (varyHeader) {
      response.headers.set('Vary', varyHeader)
    }
  }
  return response
}

export function cors(
  inputOptions: CorsOptions = {},
  request: Request,
  response: Response,
): Response {
  const options: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: true,
    ...inputOptions,
  }
  if (request.method === 'OPTIONS') {
    const headers = [
      ...configureOrigin(options, request),
      ...configureMethods(options),
      ...configureCredentials(options),
      ...configureAllowedHeaders(options, request),
      ...configureExposedHeaders(options),
      ...configureMaxAge(options),
    ]
    return applyHeaders(headers, response)
  }
  const headers = [
    ...configureOrigin(options, request),
    ...configureCredentials(options),
    ...configureExposedHeaders(options),
  ]
  return applyHeaders(headers, response)
}

/**
 * A function that wraps a request handler to add CORS headers to the response. Provides an
 * `OPTIONS` member which returns a default response, with CORS headers, for an OPTIONS request.
 */
export interface CorsWrapper {
  (handler: RequestHandler): RequestHandler
  OPTIONS: RequestHandler
}

/**
 * Creates a {@link CorsWrapper} function that wraps a `RequestHandler` function and applies CORS
 * headers to the response. Also provides an `OPTIONS` member that returns a default response for
 * OPTIONS requests.
 */
export function createCorsWrapper(options: CorsOptions = {}): CorsWrapper {
  const corsWrapper = function corsWrapper(handler: RequestHandler): RequestHandler {
    return async (event) => {
      const { request } = event
      const response = await handler(event)
      return cors(options, request, response)
    }
  }
  corsWrapper.OPTIONS = corsWrapper(
    async () => new Response(null, { status: options.optionsStatusSuccess ?? 204 }),
  )
  return corsWrapper
}
