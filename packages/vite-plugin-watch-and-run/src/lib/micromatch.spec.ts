// micromatch.isMatch(absolutePath, info.watch)
import micromatch from 'micromatch'
import { describe, expect, it } from 'vitest'

describe('micromatch', () => {
	it('1', async () => {
		expect(
			micromatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.server.ts', '**/+page.server.ts'),
		).toBe(true)
	})

	it('2', async () => {
		expect(
			micromatch.isMatch(
				'/home/asbPath/site/[id]/one/[hello]/+page.server.ts',
				'**/(+page.server.ts)',
			),
		).toBe(true)
	})

	it('3', async () => {
		expect(
			micromatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.server.ts', [
				'**/+page.server.ts',
				'**/+page.svelte',
			]),
		).toBe(true)
	})

	it('4', async () => {
		expect(
			micromatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.server.ts', ['**/+page.svelte']),
		).toBe(false)
	})

	it('5', async () => {
		expect(
			micromatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.svelte', [
				'**/+page.server.ts',
				'**/+page.svelte',
			]),
		).toBe(true)
	})

	it('5', async () => {
		expect(
			micromatch.isMatch('/home/asbPath/site/[id]/one/[hello]/+page.svelteNOT', [
				'**/+page.server.ts',
				'**/+page.svelte',
			]),
		).toBe(false)
	})
})
