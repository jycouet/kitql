import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'

import { read } from '@kitql/internals'

import { transformDecorator } from './transformDecorator.js'
import { nullifyImports } from './transformPackage.js'

describe('decorator build output', () => {
	// Helper function to set up test environment
	async function setupTestEnvironment(code: string, decoratorsConfig: any[], nullify: string[]) {
		// Create a temporary directory for the test
		const tempDir = join(process.cwd(), 'temp-test-build')

		// Clean up any previous test runs
		rmSync(tempDir, { recursive: true, force: true })
		mkdirSync(tempDir, { recursive: true })
		mkdirSync(join(tempDir, 'src'), { recursive: true })

		// Transform the code with our decorator transformer
		await nullifyImports(code, nullify)
		const transformed = await transformDecorator(code, decoratorsConfig)
		// console.info('Transformed code:', transformed.code)

		// Write the transformed code to a temporary file
		const inputFile = join(tempDir, 'src', 'input.ts')
		writeFileSync(inputFile, transformed.code)

		// Create a simple package.json
		const packageJsonFile = join(tempDir, 'package.json')
		writeFileSync(
			packageJsonFile,
			JSON.stringify({
				name: 'test-build',
				type: 'module',
			}),
		)

		// Create a tsconfig.json
		const tsconfigFile = join(tempDir, 'tsconfig.json')
		writeFileSync(
			tsconfigFile,
			JSON.stringify({
				compilerOptions: {
					target: 'ESNext',
					useDefineForClassFields: true,
					module: 'ESNext',
					lib: ['ESNext', 'DOM'],
					moduleResolution: 'Node',
					strict: true,
					resolveJsonModule: true,
					isolatedModules: true,
					esModuleInterop: true,
					noEmit: true,
					noUnusedLocals: true,
					noUnusedParameters: true,
					noImplicitReturns: true,
					experimentalDecorators: true,
				},
				include: ['src/**/*.ts'],
			}),
		)

		// Create a simple index.html
		const indexHtmlFile = join(tempDir, 'index.html')
		writeFileSync(
			indexHtmlFile,
			`
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<title>Test</title>
				</head>
				<body>
					<script type="module" src="/src/input.ts"></script>
				</body>
			</html>
		`,
		)

		// Create a simple Vite config
		const viteConfigFile = join(tempDir, 'vite.config.js')
		writeFileSync(
			viteConfigFile,
			`
			import { defineConfig } from 'vite';
			
			export default defineConfig({
				define: {
					'import.meta.env.SSR': false,
					'AUTH_SECRET': "'FAKE_SECRET_FOR_TEST'"
				},
				build: {
					outDir: 'dist',
					minify: false,
					rollupOptions: {
						output: {
							entryFileNames: 'bundle.js'
						},
					}
				},
				resolve: {
					alias: {
						'$env/static/private': '${join(tempDir, 'src', 'env-mock.js')}'
					}
				}
			});
		`,
		)

		// Create a mock for $env/static/private
		const envMockFile = join(tempDir, 'src', 'env-mock.js')
		writeFileSync(
			envMockFile,
			`
			export const AUTH_SECRET = 'FAKE_SECRET_FOR_TEST';
		`,
		)

		// Run Vite build
		await build({
			configFile: viteConfigFile,
			root: tempDir,
			logLevel: 'info',
		})

		// Read the output file
		const outputFile = join(tempDir, 'dist', 'bundle.js')
		const outputContent = readFileSync(outputFile, 'utf-8')

		return { outputContent, tempDir }
	}

	it('should verify that import.meta.env.SSR condition is removed in the build output for TasksController', async () => {
		// Sample code with BackendMethod decorator
		const code = `import { Allow, BackendMethod, remult } from "remult";

export class TasksController {
  static async regularMethod(completed: boolean) {
    const result = "This is a regular method";
    console.log(result);
    return result;
  }

  @BackendMethod({ allowed: Allow.authenticated })
  static async backendMethod(completed: boolean) {
    console.log("This should only run on the server");
    
    // This is the code that should only be included in SSR builds
    const secretValue = "SECRET_123";
    console.log("Secret value:", secretValue);
    
    return "Backend operation completed";
  }
}`

		try {
			const { outputContent } = await setupTestEnvironment(code, [{ decorator: 'BackendMethod' }], [])

			// Verify the output that should NOT be present
			expect(outputContent).not.toContain('import.meta.env.SSR')
			expect(outputContent).not.toContain('SECRET_123')
			expect(outputContent).not.toContain('This should only run on the server')

			// The regular method should still be there
			expect(outputContent).toContain('This is a regular method')

			// The BackendMethod decorator should still be there (but empty)
			expect(outputContent).toContain('BackendMethod')
			expect(outputContent).toContain('backendMethod')
		} finally {
			// Clean up
			rmSync(join(process.cwd(), 'temp-test-build'), { recursive: true, force: true })
		}
	})

	it('should verify that BackendMethod is removed in the build output for User entity', async () => {
		// Sample code based on User.ts
		const code = read(join(process.cwd(), 'src', 'shared', 'User.ts')) ?? ''

		try {
			const { outputContent } = await setupTestEnvironment(
				code,
				[
					{ decorator: 'BackendMethod' },
					{
						decorator: 'Entity',
						args_1: [{ fn: 'backendPrefilter' }, { fn: 'backendPreprocessFilter' }],
					},
				],
				['$env/static/private'],
			)

			// Verify the output that should NOT be present
			expect(outputContent).not.toContain('import.meta.env.SSR')
			expect(outputContent).not.toContain('AUTH_SECRET')
			expect(outputContent).not.toContain('backendPrefilter_top_secret')
			expect(outputContent).not.toContain('backendPreprocessFilter_top_secret')

			// The Entity decorator and class structure should still be there
			expect(outputContent).toContain('Entity')
			expect(outputContent).toContain('User')
			expect(outputContent).toContain('Fields.uuid')
			expect(outputContent).toContain('Fields.string')

			// The BackendMethod decorator should still be there (but the method body should be empty)
			expect(outputContent).toContain('BackendMethod')
			expect(outputContent).toContain('hi')
		} finally {
			// Clean up
			rmSync(join(process.cwd(), 'temp-test-build'), { recursive: true, force: true })
		}
	})
})
