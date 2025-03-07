import { expect, test } from '@playwright/test'

import { assertDefined } from './utils.js'

// NOTE: all these tests rely on the behavior of the httpbin.org service

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

test.describe('requests with correct origin', () => {
	test('proxies requests as expected to specified endpoint', async ({ request, baseURL }) => {
		assertDefined(baseURL)
		const response = await request.get('/proxy/status/200', {
			headers: {
				origin: baseURL,
			},
		})
		expect(response.status()).toBe(200)
	})
	test('sets the host header to the target url host', async ({ request, baseURL }) => {
		assertDefined(baseURL)
		const response = await request.get('/proxy/headers', {
			headers: {
				origin: baseURL,
			},
		})
		expect(response.status()).toBe(200)
		const body = await response.json()
		expect(body.headers['Host']).toBe('eu.httpbin.org')
	})
	test('proxies the query parameters', async ({ request, baseURL }) => {
		assertDefined(baseURL)
		const response = await request.get('/proxy/get?param=value', {
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
		const response = await request.post('/proxy/post', {
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
		const response = await request.post('/proxy/post', {
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
		const response = await request.post('/proxy/post', {
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
		const response = await request.delete('/proxy/delete', {
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
		const response = await request.put('/proxy/put', {
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
		const response = await request.patch('/proxy/patch', {
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
