import type { RequestHandler } from '@sveltejs/kit'
import { append } from 'vary'

type StaticOrigin = boolean | string | RegExp | Array<string | RegExp>

export interface CorsOptions {
  /**
   * @default '*''
   */
  origin?: StaticOrigin | undefined
  /**
   * @default 'GET,HEAD,PUT,PATCH,POST,DELETE'
   */
  methods?: string | string[] | undefined
  allowedHeaders?: string | string[] | undefined
  exposedHeaders?: string | string[] | undefined
  credentials?: boolean | undefined
  maxAge?: number | undefined
}

export type CorsOptionsByPath = Array<[string | RegExp, CorsOptions]>

type ConfiguredHeaders = Array<[string, string]>

function configureOrigin({ origin }: CorsOptions, req: Request): ConfiguredHeaders {
  const requestOrigin = req.headers.get('Origin')
  if (origin === '*' || origin == null) {
    return [['Access-Control-Allow-Origin', '*']]
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
  if (allowedHeaders == null) {
    // if unspecified, reflect request headers
    const requestHeaders = req.headers.get('Access-Control-Request-Headers')
    if (requestHeaders) {
      return [
        ['Access-Control-Allow-Headers', requestHeaders],
        ['Vary', 'Access-Control-Request-Headers'],
      ]
    }
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

function isOriginAllowed(requestOrigin: string, origin: StaticOrigin): boolean {
  if (Array.isArray(origin)) {
    for (const originPattern of origin) {
      if (isOriginAllowed(requestOrigin, originPattern)) {
        return true
      }
    }
    return false
  }
  if (typeof origin === 'string') {
    return requestOrigin === origin
  }
  if (origin instanceof RegExp) {
    return origin.test(requestOrigin)
  }
  return !!origin
}

export function cors(
  inputOptions: CorsOptions = {},
  request: Request,
  response: Response,
): Response {
  const options: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
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

export const CreateCorsWrapper =
  (options: CorsOptions = {}) =>
  (handler: RequestHandler): RequestHandler =>
  async (event) => {
    const { request } = event
    const response = await handler(event)
    return cors(options, request, response)
  }
