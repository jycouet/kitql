// picomatch.isMatch(absolutePath, info.watch)
import picomatch from 'picomatch'
import { describe, expect, it } from 'vitest'

describe('picomatch', () => {
	it('1', async () => {
		expect(
			picomatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.server.ts', '**/+page.server.ts'),
		).toBe(true)
	})

	it('2', async () => {
		expect(
			picomatch.isMatch(
				'/home/asbPath/site/[id]/one/[hello]/+page.server.ts',
				'**/(+page.server.ts)',
			),
		).toBe(true)
	})

	it('3', async () => {
		expect(
			picomatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.server.ts', [
				'**/+page.server.ts',
				'**/+page.svelte',
			]),
		).toBe(true)
	})

	it('4', async () => {
		expect(
			picomatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.server.ts', ['**/+page.svelte']),
		).toBe(false)
	})

	it('5', async () => {
		expect(
			picomatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.svelte', [
				'**/+page.server.ts',
				'**/+page.svelte',
			]),
		).toBe(true)
	})

	it('5', async () => {
		expect(
			picomatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.svelteNOT', [
				'**/+page.server.ts',
				'**/+page.svelte',
			]),
		).toBe(false)
	})
})
