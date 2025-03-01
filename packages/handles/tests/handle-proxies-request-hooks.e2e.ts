import { expect, test } from '@playwright/test'

import { assertDefined } from './utils.js'

// NOTE: all these tests rely on the behavior of the httpbin.org service

test('default behavior: forbids requests with incorrect origin', async ({ request }) => {
  const response = await request.get('/proxy-advanced/status/200', {
    headers: {
      origin: 'http://example.com',
    },
  })
  expect(response.status()).toBe(403)
})

test('default behavior: forbids requests with no origin specified', async ({ request }) => {
  const response = await request.get('/proxy-advanced/status/200')
  expect(response.status()).toBe(403)
})

test.describe('default behavior: requests with correct origin', () => {
  test('proxies requests as expected to specified endpoint', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/status/200', {
      headers: {
        origin: baseURL,
      },
    })
    expect(response.status()).toBe(200)
  })
  test('sets the host header to the target url host', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/headers', {
      headers: {
        origin: baseURL,
      },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.headers.Host).toBe('eu.httpbin.org')
  })
  test('proxies the query parameters', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/get?param=value', {
      headers: {
        origin: baseURL,
      },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.args).toStrictEqual({ param: 'value' })
  })
  test('proxies the application/json body of a post request', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.post('/proxy-advanced/post', {
      headers: {
        origin: baseURL,
      },
      data: { foo: 'bar' },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.headers['Content-Type']).toBe('application/json')
    expect(body.json).toStrictEqual({ foo: 'bar' })
  })
  test('proxies the application/x-www-form-urlencoded body of a post request', async ({
    request,
    baseURL,
  }) => {
    assertDefined(baseURL)
    const response = await request.post('/proxy-advanced/post', {
      headers: {
        origin: baseURL,
      },
      form: { foo: 'bar' },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    const contentTypeHeader = body.headers['Content-Type']
    assertDefined(contentTypeHeader)
    expect(contentTypeHeader.startsWith('application/x-www-form-urlencoded')).toBe(true)
    expect(body.form).toStrictEqual({ foo: 'bar' })
  })
  test('proxies the multipart/form-data body of a post request', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.post('/proxy-advanced/post', {
      headers: {
        origin: baseURL,
      },
      multipart: {
        foo: 'bar',
        file_input: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('file content'),
        },
      },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    const contentTypeHeader = body.headers['Content-Type']
    assertDefined(contentTypeHeader)
    expect(contentTypeHeader.startsWith('multipart/form-data')).toBe(true)
    expect(body.form).toStrictEqual({ foo: 'bar' })
    expect(body.files).toStrictEqual({ file_input: 'file content' })
  })
  test('proxies the application/json body of a delete request', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.delete('/proxy-advanced/delete', {
      headers: {
        origin: baseURL,
      },
      data: { foo: 'bar' },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.headers['Content-Type']).toBe('application/json')
    expect(body.json).toStrictEqual({ foo: 'bar' })
  })
  test('proxies the application/json body of a put request', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.put('/proxy-advanced/put', {
      headers: {
        origin: baseURL,
      },
      data: { foo: 'bar' },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.headers['Content-Type']).toBe('application/json')
    expect(body.json).toStrictEqual({ foo: 'bar' })
  })
  test('proxies the application/json body of a patch request', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.patch('/proxy-advanced/patch', {
      headers: {
        origin: baseURL,
      },
      data: { foo: 'bar' },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.headers['Content-Type']).toBe('application/json')
    expect(body.json).toStrictEqual({ foo: 'bar' })
  })
})

test.describe('custom requestHook behavior', () => {
  test('allows redirect()', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/test-redirect', {
      headers: { origin: baseURL },
      maxRedirects: 0,
    })
    expect(response.status()).toBe(302)
    expect(response.headers().location).toBe('https://kitql.dev/')
  })
  test('allows error()', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/test-error', {
      headers: { origin: baseURL },
    })
    expect(response.status()).toBe(418)
    const body = await response.json()
    expect(body).toStrictEqual({
      message: 'Custom teapot-related error message',
      isTeapot: true,
    })
  })
  test('proxies requests with new paths matching the prefix', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/test-rewrite-path-same-prefix', {
      headers: { origin: baseURL },
    })
    expect(response.status()).toBe(208)
  })
  test('allows and does not proxy new paths that do not match the prefix', async ({
    request,
    baseURL,
  }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/test-rewrite-path-no-matching-prefix', {
      headers: { origin: baseURL },
    })
    expect(response.status()).toBe(200)
    // proxied to cors custom header testing endpoint
    expect(response.headers()['x-custom-header']).toBe('custom get value')
  })
  test('allows using locals', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/test-using-locals', {
      headers: { origin: baseURL },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.args).toStrictEqual({ test_data: 'test-locals-data' })
  })
  test('allows manipulation of request headers before proxying', async ({ request, baseURL }) => {
    assertDefined(baseURL)
    const response = await request.get('/proxy-advanced/test-manipulating-headers', {
      headers: {
        origin: baseURL,
        Authorization: 'Bearer token',
      },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.headers.Authorization).toBeUndefined()
    expect(body.headers['X-Api-Key']).toBe('sample-api-key')
  })
})
