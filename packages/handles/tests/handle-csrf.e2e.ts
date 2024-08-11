import { expect, test } from '@playwright/test'

test.describe('CSRF endpoint with all origins allowed', async () => {
  test('POST /api/csrf-handler/all-origins, no origin', async ({ request }) => {
    const response = await request.post('/api/csrf-handler/all-origins', { form: { key: 'value' } })
    expect(response.status()).toBe(200)
  })
  test('PUT /api/csrf-handler/all-origins, no origin', async ({ request }) => {
    const response = await request.put('/api/csrf-handler/all-origins', { form: { key: 'value' } })
    expect(response.status()).toBe(200)
  })
  test('PATCH /api/csrf-handler/all-origins, no origin', async ({ request }) => {
    const response = await request.patch('/api/csrf-handler/all-origins', {
      form: { key: 'value' },
    })
    expect(response.status()).toBe(200)
  })
  test('DELETE /api/csrf-handler/all-origins, no origin', async ({ request }) => {
    const response = await request.delete('/api/csrf-handler/all-origins', {
      form: { key: 'value' },
    })
    expect(response.status()).toBe(200)
  })
  test('POST /api/csrf-handler/all-origins, with origin', async ({ request }) => {
    const response = await request.post('/api/csrf-handler/all-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('PUT /api/csrf-handler/all-origins, with origin', async ({ request }) => {
    const response = await request.put('/api/csrf-handler/all-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('PATCH /api/csrf-handler/all-origins, with origin', async ({ request }) => {
    const response = await request.patch('/api/csrf-handler/all-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('DELETE /api/csrf-handler/all-origins, with origin', async ({ request }) => {
    const response = await request.delete('/api/csrf-handler/all-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200)
  })
})

test.describe('CSRF endpoint with some origins allowed', async () => {
  test('POST /api/csrf-handler/some-origins, no origin', async ({ request }) => {
    const response = await request.post('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
    })
    expect(response.status()).toBe(403)
  })
  test('PUT /api/csrf-handler/some-origins, no origin', async ({ request }) => {
    const response = await request.put('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
    })
    expect(response.status()).toBe(403)
  })
  test('PATCH /api/csrf-handler/some-origins, no origin', async ({ request }) => {
    const response = await request.patch('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
    })
    expect(response.status()).toBe(403)
  })
  test('DELETE /api/csrf-handler/some-origins, no origin', async ({ request }) => {
    const response = await request.delete('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
    })
    expect(response.status()).toBe(403)
  })
  test('POST /api/csrf-handler/some-origins, with origin matching string', async ({ request }) => {
    const response = await request.post('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('PUT /api/csrf-handler/some-origins, with origin matching string', async ({ request }) => {
    const response = await request.put('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('PATCH /api/csrf-handler/some-origins, with origin matching string', async ({ request }) => {
    const response = await request.patch('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('DELETE /api/csrf-handler/some-origins, with origin matching string', async ({
    request,
  }) => {
    const response = await request.delete('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('POST /api/csrf-handler/some-origins, with origin matching regex', async ({ request }) => {
    const response = await request.post('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://sub.trusted-domain.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('PUT /api/csrf-handler/some-origins, with origin matching regex', async ({ request }) => {
    const response = await request.put('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://sub.trusted-domain.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('PATCH /api/csrf-handler/some-origins, with origin matching regex', async ({ request }) => {
    const response = await request.patch('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://sub.trusted-domain.com' },
    })
    expect(response.status()).toBe(200)
  })
  test('DELETE /api/csrf-handler/some-origins, with origin matching regex', async ({ request }) => {
    const response = await request.delete('/api/csrf-handler/some-origins', {
      form: { key: 'value' },
      headers: { origin: 'http://sub.trusted-domain.com' },
    })
    expect(response.status()).toBe(200)
  })
})

test.describe('CSRF endpoint with no options (default csrf behavior)', async () => {
  test('POST /api/csrf-handler/no-options, no origin', async ({ request }) => {
    const response = await request.post('/api/csrf-handler/no-options', { form: { key: 'value' } })
    expect(response.status()).toBe(403)
  })
  test('PUT /api/csrf-handler/no-options, no origin', async ({ request }) => {
    const response = await request.put('/api/csrf-handler/no-options', { form: { key: 'value' } })
    expect(response.status()).toBe(403)
  })
  test('PATCH /api/csrf-handler/no-options, no origin', async ({ request }) => {
    const response = await request.patch('/api/csrf-handler/no-options', {
      form: { key: 'value' },
    })
    expect(response.status()).toBe(403)
  })
  test('DELETE /api/csrf-handler/no-options, no origin', async ({ request }) => {
    const response = await request.delete('/api/csrf-handler/no-options', {
      form: { key: 'value' },
    })
    expect(response.status()).toBe(403)
  })
  test('POST /api/csrf-handler/no-options, with origin', async ({ request }) => {
    const response = await request.post('/api/csrf-handler/no-options', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(403)
  })
  test('PUT /api/csrf-handler/no-options, with origin', async ({ request }) => {
    const response = await request.put('/api/csrf-handler/no-options', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(403)
  })
  test('PATCH /api/csrf-handler/no-options, with origin', async ({ request }) => {
    const response = await request.patch('/api/csrf-handler/no-options', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(403)
  })
  test('DELETE /api/csrf-handler/no-options, with origin', async ({ request }) => {
    const response = await request.delete('/api/csrf-handler/no-options', {
      form: { key: 'value' },
      headers: { origin: 'http://google.com' },
    })
    expect(response.status()).toBe(403)
  })
})
