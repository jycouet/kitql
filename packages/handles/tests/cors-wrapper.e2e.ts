import { expect, test } from '@playwright/test'

test.describe('CORS endpoint with no options', async () => {
  test('OPTIONS /api/wrapped-cors-endpoints/cors-default-options/basic', async ({ request }) => {
    const response = await request.fetch('/api/wrapped-cors-endpoints/cors-default-options/basic', {
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
  test('OPTIONS /api/wrapped-cors-endpoints/cors-default-options/basic with origin and Access-Control-Request-Headers', async ({
    request,
  }) => {
    const response = await request.fetch('/api/wrapped-cors-endpoints/cors-default-options/basic', {
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
    expect(response.headers()['vary']).toBe('Access-Control-Request-Headers')
  })
  test('GET /api/wrapped-cors-endpoints/cors-default-options/basic', async ({ request }) => {
    const response = await request.get('/api/wrapped-cors-endpoints/cors-default-options/basic')
    expect(response.status()).toBe(200)
    expect(await response.json()).toEqual({ message: 'Success message' })
    expect(response.headers()['access-control-allow-origin']).toBe('*')
    expect(response.headers()['access-control-allow-methods']).toBeUndefined()
    expect(response.headers()['access-control-allow-headers']).toBeUndefined()
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers()['access-control-max-age']).toBeUndefined()
    expect(response.headers()['vary']).toBeUndefined()
  })
  test('OPTIONS /api/wrapped-cors-endpoints/cors-default-options/with-response-headers', async ({
    request,
  }) => {
    const response = await request.fetch(
      '/api/wrapped-cors-endpoints/cors-default-options/with-response-headers',
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
    expect(response.headers()['access-control-max-age']).toBeUndefined()
    expect(response.headers()['x-custom-header']).toBe('custom value')
  })
  test('OPTIONS to nonexistent path', async ({ request }) => {
    const response = await request.fetch(
      '/api/wrapped-cors-endpoints/cors-default-options/missing',
      {
        method: 'OPTIONS',
      },
    )
    expect(response.status()).toBe(404)
  })
})

test.describe('CORS endpoint with origin set to reflect', async () => {
  test('OPTIONS /api/wrapped-cors-endpoints/cors-reflect', async ({ request }) => {
    const response = await request.fetch('/api/wrapped-cors-endpoints/cors-reflect', {
      method: 'OPTIONS',
    })
    expect(response.status()).toBe(204)
    expect(response.headers()['access-control-allow-origin']).toBeUndefined()
    expect(response.headers()['access-control-allow-methods']).toBe(
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    )
    expect(response.headers()['access-control-allow-headers']).toBeUndefined()
    expect(response.headers()['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers()['access-control-expose-headers']).toBeUndefined()
    expect(response.headers()['access-control-max-age']).toBeUndefined()
    expect(response.headers()['vary']).toBe('Origin')
  })
  test('OPTIONS /api/wrapped-cors-endpoints/cors-reflect with origin', async ({ request }) => {
    const response = await request.fetch('/api/wrapped-cors-endpoints/cors-reflect', {
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
    expect(response.headers()['vary']).toBe('Origin')
  })
})

test.describe('CORS endpoint with complex options', async () => {
  test('OPTIONS /api/wrapped-cors-endpoints/cors-complex-options, no origin', async ({
    request,
  }) => {
    const response = await request.fetch('/api/wrapped-cors-endpoints/cors-complex-options', {
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
  test('OPTIONS /api/wrapped-cors-endpoints/cors-complex-options with non-matching origin', async ({
    request,
  }) => {
    const response = await request.fetch('/api/wrapped-cors-endpoints/cors-complex-options', {
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
  test('OPTIONS /api/wrapped-cors-endpoints/cors-complex-options with matching origin', async ({
    request,
  }) => {
    const response = await request.fetch('/api/wrapped-cors-endpoints/cors-complex-options', {
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
  test('OPTIONS /api/wrapped-cors-endpoints/cors-complex-options with matching origin regex', async ({
    request,
  }) => {
    const response = await request.fetch('/api/wrapped-cors-endpoints/cors-complex-options', {
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
