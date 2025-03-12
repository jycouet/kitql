import { describe, expect, it } from 'vitest'
import { build } from 'vite'
import { transformDecorator } from './transformDecorator.js'
import { writeFileSync, mkdirSync, rmSync, readFileSync } from 'fs'
import { join } from 'path'

describe('decorator build output', () => {
	it('should verify that import.meta.env.SSR condition is removed in the build output', async () => {
		// Create a temporary directory for the test
		const tempDir = join(process.cwd(), 'temp-test-build')
		try {
			// Clean up any previous test runs
			rmSync(tempDir, { recursive: true, force: true })
			mkdirSync(tempDir, { recursive: true })
			mkdirSync(join(tempDir, 'src'), { recursive: true })

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

			// Transform the code with our decorator transformer
			const transformed = await transformDecorator(code, ['BackendMethod'])

			console.info('Transformed code:', transformed.code)

			// Write the transformed code to a temporary file
			const inputFile = join(tempDir, 'src', 'input.ts')
			writeFileSync(inputFile, transformed.code)

			// Create a simple package.json
			const packageJsonFile = join(tempDir, 'package.json')
			writeFileSync(packageJsonFile, JSON.stringify({
				name: "test-build",
				type: "module"
			}))

			// Create a tsconfig.json
			const tsconfigFile = join(tempDir, 'tsconfig.json')
			writeFileSync(tsconfigFile, JSON.stringify({
				compilerOptions: {
					target: "ESNext",
					useDefineForClassFields: true,
					module: "ESNext",
					lib: ["ESNext", "DOM"],
					moduleResolution: "Node",
					strict: true,
					resolveJsonModule: true,
					isolatedModules: true,
					esModuleInterop: true,
					noEmit: true,
					noUnusedLocals: true,
					noUnusedParameters: true,
					noImplicitReturns: true,
					experimentalDecorators: true
				},
				include: ["src/**/*.ts"]
			}))

			// Create a simple index.html
			const indexHtmlFile = join(tempDir, 'index.html')
			writeFileSync(indexHtmlFile, `
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
			`)

			// Create a simple Vite config
			const viteConfigFile = join(tempDir, 'vite.config.js')
			writeFileSync(viteConfigFile, `
				import { defineConfig } from 'vite';
				
				export default defineConfig({
					define: {
						'import.meta.env.SSR': false
					},
					build: {
						outDir: 'dist',
						minify: false,
						rollupOptions: {
							output: {
								entryFileNames: 'bundle.js'
							}
						}
					}
				});
			`)

			// Run Vite build
			await build({
				configFile: viteConfigFile,
				root: tempDir,
				logLevel: 'info'
			})

			// Read the output file
			const outputFile = join(tempDir, 'dist', 'bundle.js')
			const outputContent = readFileSync(outputFile, 'utf-8')

			// console.info('Output:', outputContent)
			// console.info('Output length:', outputContent.length)

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
			rmSync(tempDir, { recursive: true, force: true })
		}
	})
}) 