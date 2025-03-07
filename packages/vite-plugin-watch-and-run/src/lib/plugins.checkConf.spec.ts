import type { ViteDevServer } from 'vite'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { watchAndRun } from './index.js'

describe('vite-plugin-watch-and-run', () => {
	it('Should throw an error as no config is sent', async () => {
		const p = watchAndRun(null as any)
		try {
			p.getCheckedConf()
		} catch (error: any) {
			expect(error.message).toEqual('plugin watchAndRun, `params` needs to be an array.')
		}
	})

	it('Should throw an error as no watch', async () => {
		const p = watchAndRun([{} as any])
		try {
			await p.getCheckedConf()
		} catch (error: any) {
			expect(error.message).toEqual('plugin watch-and-run, `watch` or `watchFile` is missing.')
		}
	})

	it('Should throw an error as no run', async () => {
		const p = watchAndRun([{ watch: 'hello!' } as any])
		try {
			p.getCheckedConf()
		} catch (error: any) {
			expect(error.message).toEqual('plugin watch-and-run, `run` is missing.')
		}
	})

	it('Should have a valid conf, with default all defaults', async () => {
		const p = watchAndRun([
			{
				watch: ['**/*.(gql|graphql)', '**/*.ts'],
				run: 'npm run gen',
			},
		])

		expect(p.getCheckedConf()).toMatchInlineSnapshot(`
      [
        {
          "delay": 300,
          "formatErrors": undefined,
          "isRunning": false,
          "kind": [
            "add",
            "change",
            "unlink",
          ],
          "logs": [
            "trigger",
            "streamData",
            "streamError",
            "end",
          ],
          "name": undefined,
          "run": "npm run gen",
          "shell": true,
          "watch": [
            "**/*.(gql|graphql)",
            "**/*.ts",
          ],
          "watchFile": undefined,
        },
      ]
    `)
	})
})

describe('configureServer', () => {
	let mockServer: ViteDevServer

	beforeEach(() => {
		// Create mock watcher with all required methods
		const mockWatcher = {
			add: vi.fn(),
			on: vi.fn(),
		}

		// Create mock server
		mockServer = {
			watcher: mockWatcher,
		} as unknown as ViteDevServer
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('should add watch patterns to server watcher', async () => {
		const watchPattern = '**/*.(gql|graphql)'
		const p = watchAndRun([
			{
				watch: watchPattern,
				run: 'npm run gen',
			},
		])

		await p.configureServer(mockServer)

		expect(mockServer.watcher.add).toHaveBeenCalledWith(watchPattern)
	})

	it('should set up watchers for all kindWithPath events', async () => {
		const p = watchAndRun([
			{
				watch: '**/*.(gql|graphql)',
				run: 'npm run gen',
			},
		])

		await p.configureServer(mockServer)

		// Should set up watchers for add, addDir, change, unlink, unlinkDir
		expect(mockServer.watcher.on).toHaveBeenCalledWith('add', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('change', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('unlink', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('addDir', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('unlinkDir', expect.any(Function))
	})

	it('should set up watchers for all kindWithoutPath events', async () => {
		const p = watchAndRun([
			{
				watch: '**/*.(gql|graphql)',
				run: 'npm run gen',
			},
		])

		await p.configureServer(mockServer)

		// Should set up watchers for all, error, raw, ready
		expect(mockServer.watcher.on).toHaveBeenCalledWith('all', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('error', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('raw', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('ready', expect.any(Function))
	})

	it('should handle multiple watch patterns', async () => {
		const watchPatterns = ['**/*.gql', '**/*.graphql']
		const p = watchAndRun([
			{
				watch: watchPatterns,
				run: 'npm run gen',
			},
		])

		await p.configureServer(mockServer)

		expect(mockServer.watcher.add).toHaveBeenCalledWith(watchPatterns)
	})

	it('should not add watcher if no watch pattern is provided', async () => {
		const p = watchAndRun([
			{
				watchFile: async () => true,
				run: 'npm run gen',
			},
		])

		await p.configureServer(mockServer)

		expect(mockServer.watcher.add).not.toHaveBeenCalled()
	})

	it('should handle array of watch patterns with different file types', async () => {
		const watchPatterns = ['**/*.gql', '**/*.graphql', '**/*.ts', 'src/**/*.json']
		const p = watchAndRun([
			{
				watch: watchPatterns,
				run: 'npm run gen',
			},
			{
				// Add a second config to ensure multiple configs work with arrays
				watch: ['**/*.css', '**/*.scss'],
				run: 'npm run build:css',
			},
		])

		await p.configureServer(mockServer)

		// Should add both watch pattern arrays
		expect(mockServer.watcher.add).toHaveBeenCalledTimes(2)
		expect(mockServer.watcher.add).toHaveBeenNthCalledWith(1, watchPatterns)
		expect(mockServer.watcher.add).toHaveBeenNthCalledWith(2, ['**/*.css', '**/*.scss'])

		// Verify all watchers are still set up
		expect(mockServer.watcher.on).toHaveBeenCalledWith('add', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('change', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('unlink', expect.any(Function))
	})

	it('should handle watch patterns outside of project root', async () => {
		const watchPatterns = [
			'../../shared/**/*.ts', // Parent directories
			'../sibling-project/**/*.graphql', // Sibling directory
			'/absolute/path/**/*.json', // Absolute path
			'./src/**/*.ts', // Regular project path
		]

		const p = watchAndRun([
			{
				watch: watchPatterns,
				run: 'npm run gen',
			},
		])

		await p.configureServer(mockServer)

		// Verify that external patterns are added to the watcher
		expect(mockServer.watcher.add).toHaveBeenCalledWith(watchPatterns)

		// Verify watchers are set up for file events
		expect(mockServer.watcher.on).toHaveBeenCalledWith('add', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('change', expect.any(Function))
		expect(mockServer.watcher.on).toHaveBeenCalledWith('unlink', expect.any(Function))
	})
})
