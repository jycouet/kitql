import { expect, test } from '@playwright/test'

test('proxies requests as expected to specified endpoint', async ({ request, baseURL }) => {
  const response = await request.get('/proxy/status/200', {
    headers: {
      origin: baseURL,
    },
  })
  expect(response.status()).toBe(200)
})

test('forbids requests with incorrect origin', async ({ request }) => {
  const response = await request.get('/proxy/status/200', {
    headers: {
      origin: 'http://example.com',
    },
  })
  expect(response.status()).toBe(403)
})

test('forbids requests with no origin specified', async ({ request }) => {
  const response = await request.get('/proxy/status/200')
  expect(response.status()).toBe(403)
})
