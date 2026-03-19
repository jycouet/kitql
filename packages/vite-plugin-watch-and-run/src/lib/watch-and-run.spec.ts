import type { ViteDevServer } from 'vite'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { watchAndRun } from './index.js'

describe('watch-and-run', () => {
	let mockServer: ViteDevServer
	let onHandlers: Record<string, (path: string) => Promise<void>>

	beforeEach(() => {
		vi.useFakeTimers()
		onHandlers = {}

		mockServer = {
			watcher: {
				add: vi.fn(),
				on: vi.fn((kind: string, handler: (path: string) => Promise<void>) => {
					onHandlers[kind] = handler
				}),
			},
		} as unknown as ViteDevServer
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.clearAllMocks()
		vi.restoreAllMocks()
	})

	async function simulateFileEvent(kind: string, path: string) {
		await onHandlers[kind](path)
		await vi.advanceTimersByTimeAsync(300)
	}

	it('should trigger run on matching glob', async () => {
		const runFn = vi.fn()
		const p = watchAndRun([{ watch: '**/*.gql', run: runFn }])

		await (p as any).configureServer(mockServer)
		await simulateFileEvent('change', '/home/project/src/schema.gql')

		expect(runFn).toHaveBeenCalledWith(mockServer, '/home/project/src/schema.gql')
	})

	it('should not trigger run on non-matching glob', async () => {
		const runFn = vi.fn()
		const p = watchAndRun([{ watch: '**/*.gql', run: runFn }])

		await (p as any).configureServer(mockServer)
		await simulateFileEvent('change', '/home/project/src/index.ts')

		expect(runFn).not.toHaveBeenCalled()
	})

	it('should trigger run with array of globs', async () => {
		const runFn = vi.fn()
		const p = watchAndRun([{ watch: ['**/*.gql', '**/*.graphql'], run: runFn }])

		await (p as any).configureServer(mockServer)
		await simulateFileEvent('change', '/home/project/src/query.graphql')

		expect(runFn).toHaveBeenCalled()
	})

	it('should trigger run with watchFile function', async () => {
		const runFn = vi.fn()
		const p = watchAndRun([
			{
				watchFile: async (path: string) => path.endsWith('.custom'),
				run: runFn,
			},
		])

		await (p as any).configureServer(mockServer)
		await simulateFileEvent('change', '/home/project/data.custom')

		expect(runFn).toHaveBeenCalled()
	})

	it('should not trigger when watchKind does not match', async () => {
		const runFn = vi.fn()
		const p = watchAndRun([{ watch: '**/*.gql', watchKind: ['add'], run: runFn }])

		await (p as any).configureServer(mockServer)
		await simulateFileEvent('change', '/home/project/schema.gql')

		expect(runFn).not.toHaveBeenCalled()
	})

	it('should trigger only the first matching config', async () => {
		const runFn1 = vi.fn()
		const runFn2 = vi.fn()
		const p = watchAndRun([
			{ watch: '**/*.gql', run: runFn1 },
			{ watch: '**/*.gql', run: runFn2 },
		])

		await (p as any).configureServer(mockServer)
		await simulateFileEvent('change', '/home/project/schema.gql')

		expect(runFn1).toHaveBeenCalled()
		expect(runFn2).not.toHaveBeenCalled()
	})

	it('should match SvelteKit paths with brackets', async () => {
		const runFn = vi.fn()
		const p = watchAndRun([{ watch: '**/+page.server.ts', run: runFn }])

		await (p as any).configureServer(mockServer)
		await simulateFileEvent('change', '/home/project/src/routes/[id]/[slug]/+page.server.ts')

		expect(runFn).toHaveBeenCalled()
	})

	it('should work with glob pointing outside project root', async () => {
		const runFn = vi.fn()
		const p = watchAndRun([{ watch: '../../shared/**/*.ts', run: runFn }])

		await (p as any).configureServer(mockServer)

		// Base path is registered with chokidar
		expect(mockServer.watcher.add).toHaveBeenCalledWith('../../shared')

		// Matching file triggers run
		await simulateFileEvent('change', '../../shared/types/index.ts')
		expect(runFn).toHaveBeenCalled()
	})

	it('should work with absolute path glob', async () => {
		const runFn = vi.fn()
		const p = watchAndRun([{ watch: '/absolute/path/**/*.json', run: runFn }])

		await (p as any).configureServer(mockServer)

		expect(mockServer.watcher.add).toHaveBeenCalledWith('/absolute/path')

		await simulateFileEvent('change', '/absolute/path/data/config.json')
		expect(runFn).toHaveBeenCalled()
	})
})
