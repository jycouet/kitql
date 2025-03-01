import { expect, test } from '@playwright/test'

test.describe('CORS endpoint with no options', async () => {
  test('OPTIONS /api/cors-handler/default-options/basic', async ({ request }) => {
    const response = await request.fetch('/api/cors-handler/default-options/basic', {
      method: 'OPTIONS',
    })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBe('*')
    expect(response.headers()['access-control-allow-methods']).toBe(
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    )
    expect(response.headers()['access-control-allow-headers']).toBeUndefined()
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers()['access-control-max-age']).toBeUndefined()
  })
  test('OPTIONS /api/cors-handler/default-options/basic with origin and Access-Control-Request-Headers', async ({
    request,
  }) => {
    const response = await request.fetch('/api/cors-handler/default-options/basic', {
      method: 'OPTIONS',
      headers: { 'Access-Control-Request-Headers': 'X-Custom-Header', Origin: 'http://google.com' },
    })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBe('*')
    expect(response.headers()['access-control-allow-methods']).toBe(
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    )
    expect(response.headers()['access-control-allow-headers']).toBe('X-Custom-Header')
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers()['access-control-max-age']).toBeUndefined()
    expect(response.headers().vary).toBe('Access-Control-Request-Headers')
  })
  test('GET /api/cors-handler/default-options/basic', async ({ request }) => {
    const response = await request.get('/api/cors-handler/default-options/basic')
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ message: 'Success message' })
    expect(response.headers()['access-control-allow-origin']).toBe('*')
    expect(response.headers()['access-control-allow-methods']).toBeUndefined()
    expect(response.headers()['access-control-allow-headers']).toBeUndefined()
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers()['access-control-max-age']).toBeUndefined()
    expect(response.headers().vary).toBeUndefined()
  })
  test('OPTIONS /api/cors-handler/default-options/with-response-headers', async ({ request }) => {
    const response = await request.fetch(
      '/api/cors-handler/default-options/with-response-headers',
      {
        method: 'OPTIONS',
      },
    )
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBe('*')
    expect(response.headers()['access-control-allow-methods']).toBe(
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    )
    expect(response.headers()['access-control-allow-headers']).toBeUndefined()
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers().vary).toBeUndefined()
    // doesn't overwrite header values from the request handler
    expect(response.headers()['access-control-max-age']).toBe('42')
    expect(response.headers()['x-custom-header']).toBe('custom options value')
  })
  test('GET /api/cors-handler/default-options/with-response-headers', async ({ request }) => {
    const response = await request.get('/api/cors-handler/default-options/with-response-headers')
    expect(response.status()).toBe(200)
    expect(response.headers()['access-control-allow-origin']).toBe('*')
    expect(response.headers()['access-control-allow-methods']).toBeUndefined()
    expect(response.headers()['access-control-allow-headers']).toBeUndefined()
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers()['access-control-max-age']).toBeUndefined()
    expect(response.headers().vary).toBeUndefined()
    // doesn't overwrite header values from the request handler
    expect(response.headers()['x-custom-header']).toBe('custom get value')
  })
  test('OPTIONS to nonexistent path', async ({ request }) => {
    const response = await request.fetch('/api/cors-handler/default-options/missing', {
      method: 'OPTIONS',
    })
    expect(response.status()).toBe(404)
  })
})

test.describe('CORS endpoint with origin set to reflect', async () => {
  test('OPTIONS /api/cors-handler/reflect', async ({ request }) => {
    const response = await request.fetch('/api/cors-handler/reflect', { method: 'OPTIONS' })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBeUndefined()
    expect(response.headers()['access-control-allow-methods']).toBe(
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    )
    expect(response.headers()['access-control-allow-headers']).toBeUndefined()
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers()['access-control-max-age']).toBeUndefined()
    expect(response.headers().vary).toBe('Origin')
  })
  test('OPTIONS /api/cors-handler/reflect with origin', async ({ request }) => {
    const response = await request.fetch('/api/cors-handler/reflect', {
      method: 'OPTIONS',
      headers: { Origin: 'http://google.com' },
    })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBe('http://google.com')
    expect(response.headers()['access-control-allow-methods']).toBe(
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    )
    expect(response.headers()['access-control-allow-headers']).toBeUndefined()
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers()['access-control-max-age']).toBeUndefined()
    expect(response.headers().vary).toBe('Origin')
  })
})

test.describe('CORS endpoint with complex options', async () => {
  test('OPTIONS /api/cors-handler/complex-options, no origin', async ({ request }) => {
    const response = await request.fetch('/api/cors-handler/complex-options', {
      method: 'OPTIONS',
    })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBeUndefined()
    expect(response.headers()['access-control-allow-methods']).toBe('GET,PUT')
    expect(response.headers()['access-control-allow-headers']).toBe('X-Allowed-Header')
    expect(response.headers()['access-control-allow-credentials']).toBe('true')
    expect(response.headers()['access-control-expose-headers']).toBe('X-Exposed-Header')
    expect(response.headers()['access-control-max-age']).toBe('42')
  })
  test('OPTIONS /api/cors-handler/complex-options with non-matching origin', async ({
    request,
  }) => {
    const response = await request.fetch('/api/cors-handler/complex-options', {
      method: 'OPTIONS',
      headers: { Origin: 'http://example.com' },
    })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBeUndefined()
    expect(response.headers()['access-control-allow-methods']).toBe('GET,PUT')
    expect(response.headers()['access-control-allow-headers']).toBe('X-Allowed-Header')
    expect(response.headers()['access-control-allow-credentials']).toBe('true')
    expect(response.headers()['access-control-expose-headers']).toBe('X-Exposed-Header')
    expect(response.headers()['access-control-max-age']).toBe('42')
  })
  test('OPTIONS /api/cors-handler/complex-options with matching origin', async ({ request }) => {
    const response = await request.fetch('/api/cors-handler/complex-options', {
      method: 'OPTIONS',
      headers: { Origin: 'http://google.com' },
    })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBe('http://google.com')
    expect(response.headers()['access-control-allow-methods']).toBe('GET,PUT')
    expect(response.headers()['access-control-allow-headers']).toBe('X-Allowed-Header')
    expect(response.headers()['access-control-allow-credentials']).toBe('true')
    expect(response.headers()['access-control-expose-headers']).toBe('X-Exposed-Header')
    expect(response.headers()['access-control-max-age']).toBe('42')
  })
  test('OPTIONS /api/cors-handler/complex-options with matching origin regex', async ({
    request,
  }) => {
    const response = await request.fetch('/api/cors-handler/complex-options', {
      method: 'OPTIONS',
      headers: { Origin: 'http://sub.trusted-domain.com' },
    })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBe('http://sub.trusted-domain.com')
    expect(response.headers()['access-control-allow-methods']).toBe('GET,PUT')
    expect(response.headers()['access-control-allow-headers']).toBe('X-Allowed-Header')
    expect(response.headers()['access-control-allow-credentials']).toBe('true')
    expect(response.headers()['access-control-expose-headers']).toBe('X-Exposed-Header')
    expect(response.headers()['access-control-max-age']).toBe('42')
  })
})

test.describe('CORS endpoint, testing edge cases', async () => {
  test('OPTIONS /api/cors-handler/edge-cases, no origin', async ({ request }) => {
    const response = await request.fetch('/api/cors-handler/edge-cases', {
      method: 'OPTIONS',
      headers: { 'Access-Control-Request-Headers': 'X-Custom-Header', Origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200) // explicitly set to 200 via optionsStatusSuccess
    expect(response.headers()['access-control-allow-origin']).toBeUndefined() // explicitly disabled
    expect(response.headers()['access-control-allow-methods']).toBeUndefined() // explicitly disabled
    expect(response.headers()['access-control-allow-headers']).toBeUndefined() // explicitly disabled
    expect(response.headers()['access-control-allow-credentials']).toBe('true') // explicitly enabled
    expect(response.headers()['access-control-expose-headers']).toBeUndefined() // not set
    expect(response.headers()['access-control-max-age']).toBeUndefined() // not set
  })
})
