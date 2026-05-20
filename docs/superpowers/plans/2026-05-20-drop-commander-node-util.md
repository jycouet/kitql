# Drop commander, share a node:util CLI parser via `@kitql/helpers/server` - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `commander` dependency from `@kitql/eslint-config` and `vite-plugin-kit-routes`, replacing it with one thin `parseCli` wrapper over `node:util` `parseArgs`, exposed from a new `@kitql/helpers/server` subpath export.

**Architecture:** A new node-only `parseCli` helper lives in `@kitql/helpers/src/lib/server/`, exported via a `./server` subpath (kept off the browser-facing main entry). The shared build script `packageJsonFormat.js` is taught to merge per-package subpath exports. Both CLI bins (`cmd.js`, `bin.ts`) are refactored onto `parseCli`; `commander` is removed from both packages and the `tooling` catalog.

**Tech Stack:** Node `node:util` parseArgs, pnpm workspace + catalogs, svelte-package + esbuild build pipeline, vitest, changesets.

**Spec:** `docs/superpowers/specs/2026-05-20-drop-commander-node-util-design.md`

---

## File Structure

- `packages/helpers/src/lib/server/parseCli.ts` (create) - the wrapper + `buildHelp`.
- `packages/helpers/src/lib/server/index.ts` (create) - re-export `parseCli` and types.
- `packages/helpers/src/lib/server/parseCli.spec.ts` (create) - unit tests (node env).
- `scripts/packageJsonFormat.js` (modify) - merge per-package subpath exports.
- `packages/helpers/package.json` (modify) - declare `./server` export.
- `packages/eslint-config/cmd.js` (modify) - use `parseCli`, drop commander.
- `packages/eslint-config/package.json` (modify) - drop commander dep.
- `packages/vite-plugin-kit-routes/src/lib/bin.ts` (modify) - use `parseCli`, drop commander.
- `packages/vite-plugin-kit-routes/package.json` (modify) - drop commander dep.
- `pnpm-workspace.yaml` (modify) - drop `commander` from `tooling` catalog.
- `.changeset/drop-commander-node-util.md` (create) - changeset.

---

## Task 0: Setup & clean baseline

**Files:** none (environment only)

- [ ] **Step 1: Install dependencies**

Run: `pnpm i`
Expected: install completes, no errors.

- [ ] **Step 2: Build the whole graph (materializes each package's `dist`, which workspace links point to)**

Run: `pnpm build`
Expected: all packages build, ends with success (no error exit).

- [ ] **Step 3: Baseline tests for the packages we will touch**

Run: `pnpm -F @kitql/helpers test:ci && pnpm -F vite-plugin-kit-routes test:ci`
Expected: all pass. If anything fails before changes, STOP and report.

---

## Task 1: `parseCli` wrapper in `@kitql/helpers/server` (TDD)

**Files:**

- Create: `packages/helpers/src/lib/server/parseCli.ts`
- Create: `packages/helpers/src/lib/server/index.ts`
- Test: `packages/helpers/src/lib/server/parseCli.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/helpers/src/lib/server/parseCli.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { parseCli } from './index.js'

describe('parseCli', () => {
	it('parses boolean and string options with short flags', () => {
		const { values } = parseCli({
			options: {
				format: { type: 'boolean', short: 'f' },
				glob: { type: 'string', short: 'g' },
			},
			args: ['-f', '--glob', 'src'],
		})
		expect(values.format).toBe(true)
		expect(values.glob).toBe('src')
	})

	it('applies defaults when an option is absent', () => {
		const { values } = parseCli({
			options: {
				glob: { type: 'string', short: 'g', default: '.' },
				verbose: { type: 'boolean', short: 'v', default: false },
			},
			args: [],
		})
		expect(values.glob).toBe('.')
		expect(values.verbose).toBe(false)
	})

	it('keeps kebab-case option names as declared', () => {
		const { values } = parseCli({
			options: {
				'diff-only': { type: 'boolean', short: 'd', default: false },
				'base-branch': { type: 'string', short: 'b', default: 'main' },
			},
			args: ['-d', '--base-branch', 'dev'],
		})
		expect(values['diff-only']).toBe(true)
		expect(values['base-branch']).toBe('dev')
	})

	it('collects positionals when allowed', () => {
		const { positionals } = parseCli({
			options: { config: { type: 'string', short: 'c' } },
			allowPositionals: true,
			args: ['sync', '--config', 'vite.config.ts'],
		})
		expect(positionals).toEqual(['sync'])
	})

	it('does not throw on --help and reports it in values', () => {
		const { values, help } = parseCli({
			name: 'demo',
			description: 'demo cli',
			options: { format: { type: 'boolean', short: 'f', description: 'format files' } },
			args: ['--help'],
		})
		expect(values.help).toBe(true)
		expect(help).toContain('demo')
		expect(help).toContain('--format')
		expect(help).toContain('format files')
	})

	it('recognizes --version only when a version is configured', () => {
		const { values } = parseCli({
			name: 'demo',
			version: '1.2.3',
			options: {},
			args: ['--version'],
		})
		expect(values.version).toBe(true)
	})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm -F @kitql/helpers test -- src/lib/server/parseCli.spec.ts`
Expected: FAIL - cannot resolve `./index.js` / `parseCli` is not defined.

- [ ] **Step 3: Write the implementation**

Create `packages/helpers/src/lib/server/parseCli.ts`:

```ts
import { parseArgs as nodeParseArgs } from 'node:util'

export interface CliOption {
	type: 'boolean' | 'string'
	short?: string
	default?: string | boolean
	description?: string
}

export interface CliConfig {
	name?: string
	description?: string
	version?: string
	options: Record<string, CliOption>
	allowPositionals?: boolean
	/** Defaults to process.argv.slice(2). */
	args?: string[]
}

export interface CliResult {
	values: Record<string, string | boolean | undefined>
	positionals: string[]
	help: string
}

/**
 * Thin wrapper over node:util parseArgs.
 * - Applies defaults itself (node:util `default` is not available across all Node >=18).
 * - Auto-registers `help` (-h) and, when a version is set, `version`, so strict mode
 *   does not throw on those flags. Does NOT print or exit - the caller decides.
 */
export function parseCli(config: CliConfig): CliResult {
	const parseOptions: Record<string, { type: 'boolean' | 'string'; short?: string }> = {}
	for (const [name, opt] of Object.entries(config.options)) {
		parseOptions[name] = { type: opt.type, ...(opt.short ? { short: opt.short } : {}) }
	}
	if (!parseOptions.help) {
		parseOptions.help = { type: 'boolean', short: 'h' }
	}
	if (config.version && !parseOptions.version) {
		parseOptions.version = { type: 'boolean' }
	}

	const { values, positionals } = nodeParseArgs({
		args: config.args ?? process.argv.slice(2),
		options: parseOptions,
		allowPositionals: config.allowPositionals ?? false,
	})

	const result = values as Record<string, string | boolean | undefined>
	for (const [name, opt] of Object.entries(config.options)) {
		if (result[name] === undefined && opt.default !== undefined) {
			result[name] = opt.default
		}
	}

	return { values: result, positionals, help: buildHelp(config) }
}

function buildHelp(config: CliConfig): string {
	const lines: string[] = []
	if (config.name) {
		lines.push(config.version ? `${config.name} v${config.version}` : config.name)
	}
	if (config.description) {
		lines.push(config.description)
	}
	if (lines.length) {
		lines.push('')
	}
	lines.push('Options:')
	const entries = Object.entries(config.options)
	for (const [name, opt] of entries) {
		const flags = [opt.short ? `-${opt.short}` : null, `--${name}`].filter(Boolean).join(', ')
		const def = opt.default !== undefined ? ` (default: ${String(opt.default)})` : ''
		lines.push(`  ${flags}${opt.description ? `  ${opt.description}` : ''}${def}`)
	}
	lines.push(`  -h, --help  show this help`)
	if (config.version) {
		lines.push(`  --version  show version`)
	}
	return lines.join('\n')
}
```

Create `packages/helpers/src/lib/server/index.ts`:

```ts
export { parseCli } from './parseCli.js'
export type { CliConfig, CliOption, CliResult } from './parseCli.js'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm -F @kitql/helpers test -- src/lib/server/parseCli.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Confirm the main entry stays browser-safe (no node import leaked into index)**

Run: `grep -n "server" packages/helpers/src/lib/index.ts`
Expected: no output (the server module is NOT re-exported from the main entry).

- [ ] **Step 6: Commit**

```bash
git add packages/helpers/src/lib/server/
git commit -m "feat(helpers): add node-only parseCli wrapper over node:util"
```

---

## Task 2: Wire the `./server` subpath export

**Files:**

- Modify: `scripts/packageJsonFormat.js`
- Modify: `packages/helpers/package.json`

- [ ] **Step 1: Teach `packageJsonFormat.js` to merge per-package subpath exports**

In `scripts/packageJsonFormat.js`, replace the hard-coded `exports` block:

```js
			exports: {
				'.': {
					types: './esm/index.d.ts',
					require: './cjs/index.js',
					svelte: './esm/index.js',
					default: './esm/index.js',
				},
			},
```

with a version that keeps the standard `.` entry and preserves any extra subpath exports declared in the source package.json:

```js
			exports: {
				'.': {
					types: './esm/index.d.ts',
					require: './cjs/index.js',
					svelte: './esm/index.js',
					default: './esm/index.js',
				},
				// preserve per-package subpath exports (e.g. "./server"), drop the standard "."
				...Object.fromEntries(
					Object.entries(pkg.exports ?? {}).filter(([key]) => key !== '.'),
				),
			},
```

- [ ] **Step 2: Declare the `./server` export in helpers' source package.json**

In `packages/helpers/package.json`, change the `exports` field to:

```json
	"exports": {
		".": {
			"types": "./esm/index.d.ts",
			"require": "./cjs/index.js",
			"svelte": "./esm/index.js",
			"default": "./esm/index.js"
		},
		"./server": {
			"types": "./esm/server/index.d.ts",
			"require": "./cjs/server/index.js",
			"default": "./esm/server/index.js"
		}
	},
```

- [ ] **Step 3: Build helpers and verify the export materializes in dist**

Run: `pnpm -F @kitql/helpers build`
Expected: build succeeds.

Run: `node -e "const fs=require('fs');const b='packages/helpers/dist';for(const f of ['esm/server/index.js','esm/server/index.d.ts','cjs/server/index.js']){console.log(f, fs.existsSync(b+'/'+f))};console.log('exports', JSON.stringify(require('./packages/helpers/dist/package.json').exports['./server']))"`
Expected: all three files `true`, and the printed `./server` export object matches the paths above.

- [ ] **Step 4: Confirm other packages' formatting is unchanged**

Run: `node scripts/packageJsonFormat.js` from another package and confirm only `.` remains:
`cd packages/internals && node ../../scripts/packageJsonFormat.js && node -e "console.log(Object.keys(require('./package.json').exports))" && cd ../..`
Expected: `[ '.' ]` (no spurious subpaths added). If `git diff packages/internals/package.json` shows changes, revert them: `git checkout packages/internals/package.json`.

- [ ] **Step 5: Verify `@kitql/helpers/server` resolves from a consumer**

Run: `pnpm i` (refresh links to dist) then
`node --input-type=module -e "import('@kitql/helpers/server').then(m=>console.log('parseCli', typeof m.parseCli)).catch(e=>{console.error(e);process.exit(1)})"`
Expected: `parseCli function`.

- [ ] **Step 6: Commit**

```bash
git add scripts/packageJsonFormat.js packages/helpers/package.json
git commit -m "feat(helpers): expose parseCli via ./server subpath export"
```

---

## Task 3: Refactor `@kitql/eslint-config` onto `parseCli`

**Files:**

- Modify: `packages/eslint-config/cmd.js` (lines 1-44 region)
- Modify: `packages/eslint-config/package.json`

- [ ] **Step 1: Replace the commander block in `cmd.js`**

Replace the top of `packages/eslint-config/cmd.js` from the imports through the option-extraction block. Old (current):

```js
#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { Option, program } from 'commander'

import { gray, green, Log } from '@kitql/helpers'

import { findFileOrUp } from './helper/findFileOrUp.js'

/** @type {('eslint' | 'prettier' | 'oxlint' | 'tsgolint')[]} */
const TOOLS_ALL = ['eslint', 'prettier', 'oxlint', 'tsgolint']
const TOOLS_DEFAULT = TOOLS_ALL.slice(0, 2)

program.addOption(new Option('-f, --format', 'format'))
program.addOption(new Option('-g, --glob <type>', 'file/dir/glob').default('.'))
program.addOption(
	new Option('-t, --tools <type>', 'tools to use (eslint, prettier, oxlint, tsgolint)').default(
		TOOLS_DEFAULT.join(','),
	),
)
program.addOption(new Option('-v, --verbose', 'add more logs').default(false))
program.addOption(
	new Option('-d, --diff-only', 'only check files changed against base branch').default(false),
)
program.addOption(
	new Option('-b, --base-branch <type>', 'base branch to compare against').default('main'),
)
program.addOption(
	new Option('-p, --prefix <type>', 'prefix by with "pnpm" or "npm" or "none"').default('none'),
)
program.parse(process.argv)
const options_cli = program.opts()

const pathPrettierIgnore = findFileOrUp('.prettierignore')
const pathPrettier_js = findFileOrUp('.prettierrc.js')

const format = /** @type {boolean} */ (options_cli.format ?? false)
let glob = /** @type {string} */ (options_cli.glob ?? '.')
const verbose = /** @type {boolean} */ (options_cli.verbose ?? false)
const pre = /** @type {string} */ (options_cli.prefix ?? 'none')
const tools = /** @type {typeof TOOLS_ALL} */ (options_cli.tools.split(',') ?? TOOLS_DEFAULT)
const diffOnly = /** @type {boolean} */ (options_cli.diffOnly ?? false)
const baseBranch = /** @type {string} */ (options_cli.baseBranch ?? 'main')
```

New:

```js
#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { gray, green, Log } from '@kitql/helpers'
import { parseCli } from '@kitql/helpers/server'

import { findFileOrUp } from './helper/findFileOrUp.js'

/** @type {('eslint' | 'prettier' | 'oxlint' | 'tsgolint')[]} */
const TOOLS_ALL = ['eslint', 'prettier', 'oxlint', 'tsgolint']
const TOOLS_DEFAULT = TOOLS_ALL.slice(0, 2)

const { values: options_cli, help } = parseCli({
	name: 'kitql-lint',
	options: {
		format: { type: 'boolean', short: 'f', description: 'format' },
		glob: { type: 'string', short: 'g', default: '.', description: 'file/dir/glob' },
		tools: {
			type: 'string',
			short: 't',
			default: TOOLS_DEFAULT.join(','),
			description: 'tools to use (eslint, prettier, oxlint, tsgolint)',
		},
		verbose: { type: 'boolean', short: 'v', default: false, description: 'add more logs' },
		'diff-only': {
			type: 'boolean',
			short: 'd',
			default: false,
			description: 'only check files changed against base branch',
		},
		'base-branch': {
			type: 'string',
			short: 'b',
			default: 'main',
			description: 'base branch to compare against',
		},
		prefix: {
			type: 'string',
			short: 'p',
			default: 'none',
			description: 'prefix by with "pnpm" or "npm" or "none"',
		},
	},
})

if (options_cli.help) {
	console.info(help)
	process.exit(0)
}

const pathPrettierIgnore = findFileOrUp('.prettierignore')
const pathPrettier_js = findFileOrUp('.prettierrc.js')

const format = /** @type {boolean} */ (options_cli.format ?? false)
let glob = /** @type {string} */ (options_cli.glob ?? '.')
const verbose = /** @type {boolean} */ (options_cli.verbose ?? false)
const pre = /** @type {string} */ (options_cli.prefix ?? 'none')
const tools = /** @type {typeof TOOLS_ALL} */ (
	String(options_cli.tools ?? TOOLS_DEFAULT.join(',')).split(',')
)
const diffOnly = /** @type {boolean} */ (options_cli['diff-only'] ?? false)
const baseBranch = /** @type {string} */ (options_cli['base-branch'] ?? 'main')
```

Note: the rest of `cmd.js` (everything after this block) is unchanged - it already uses the local variables `format`, `glob`, `verbose`, `pre`, `tools`, `diffOnly`, `baseBranch`.

- [ ] **Step 2: Remove the commander dependency from `@kitql/eslint-config`**

In `packages/eslint-config/package.json`, delete the line:

```json
		"commander": "catalog:tooling",
```

- [ ] **Step 3: Refresh install**

Run: `pnpm i`
Expected: completes; `commander` no longer linked into eslint-config.

- [ ] **Step 4: Smoke-test the `kitql-lint` CLI**

Run: `node packages/eslint-config/cmd.js --help`
Expected: prints the generated help (contains `kitql-lint`, `--format`, `--base-branch`); exits 0.

Run: `node packages/eslint-config/cmd.js -d -b main -g packages/eslint-config`
Expected: it runs the lint flow (it logs `Action: linting` and proceeds); no crash from arg parsing. (A lint failure exit code is acceptable here - we only care that parsing/wiring works.)

- [ ] **Step 5: Type-check eslint-config**

Run: `pnpm -F @kitql/eslint-config check 2>/dev/null || echo "no check script - skipping"`
Expected: passes, or "no check script" message. If it fails on the changed block, fix the JSDoc casts before continuing.

- [ ] **Step 6: Commit**

```bash
git add packages/eslint-config/cmd.js packages/eslint-config/package.json pnpm-lock.yaml
git commit -m "refactor(eslint-config): replace commander with parseCli"
```

---

## Task 4: Refactor `vite-plugin-kit-routes` onto `parseCli`

**Files:**

- Modify: `packages/vite-plugin-kit-routes/src/lib/bin.ts`
- Modify: `packages/vite-plugin-kit-routes/package.json`

- [ ] **Step 1: Replace commander usage in `bin.ts`**

In `packages/vite-plugin-kit-routes/src/lib/bin.ts`:

(a) Change the imports - remove commander, add parseCli:

Old:

```ts
#!/usr/bin/env node
import path from 'node:path'
import { Command } from 'commander'

import { cyan, gray, green, Log, red } from '@kitql/helpers'
import { getRelativePackagePath, read } from '@kitql/internals'

import { evaluateNode, getExportsFromFile } from './ast.js'
import { run } from './plugin.js'

const program = new Command()
const log = new Log('kit-routes')
```

New:

```ts
#!/usr/bin/env node
import path from 'node:path'

import { cyan, gray, green, Log, red } from '@kitql/helpers'
import { parseCli } from '@kitql/helpers/server'
import { getRelativePackagePath, read } from '@kitql/internals'

import { evaluateNode, getExportsFromFile } from './ast.js'
import { run } from './plugin.js'

const log = new Log('kit-routes')
```

(b) Replace the entire trailing program block. Old (from `program.name(...)` to the end of file):

```ts
program.name('kit-routes').description('CLI for kit-routes plugin').version(version)

program
	.command('sync')
	.description('Sync routes configuration')
	.option('-c, --config <path>', 'Path to config file (default: vite.config.ts)')
	.action(async (options) => {
		const config = await loadConfig(options.config)
		if (!config) {
			log.info('')
			if (exportName) {
				log.info(`  Config object should look like this:

               ${green(`import { kitRoutes, type Options } from 'vite-plugin-kit-routes'
               
               export const ${exportName}: Options = {
                 // ...
               }`)}
`)
			} else {
				log.info(`  Config object should look like this:

               ${green(`import { kitRoutes, type Options } from 'vite-plugin-kit-routes'
	
               export default {
                 // ...
               } satisfies Options`)}
`)
			}
			log.info('')
			log.info('You can specify a custom config file using --config with the following format:')
			log.info('  --config ./path/to/config.ts#named_export')
			log.info('  If no named export is specified, it will use the default export')
			log.info('')

			process.exit(1)
		}

		const success = await run(true, config)
		if (!success) {
			process.exit(1)
		}
	})

program.parse()
```

New:

```ts
const { values, positionals, help } = parseCli({
	name: 'kit-routes',
	description: 'CLI for kit-routes plugin',
	version,
	allowPositionals: true,
	options: {
		config: {
			type: 'string',
			short: 'c',
			description: 'Path to config file (default: vite.config.ts)',
		},
	},
})

if (values.version) {
	log.info(version)
	process.exit(0)
}

if (values.help || positionals[0] !== 'sync') {
	log.info(help)
	log.info('')
	log.info('Commands:')
	log.info('  sync  Sync routes configuration')
	process.exit(values.help ? 0 : 1)
}

await sync(/** @type {string | undefined} */ values.config)

async function sync(configPath?: string) {
	const config = await loadConfig(configPath)
	if (!config) {
		log.info('')
		if (exportName) {
			log.info(`  Config object should look like this:

               ${green(`import { kitRoutes, type Options } from 'vite-plugin-kit-routes'
               
               export const ${exportName}: Options = {
                 // ...
               }`)}
`)
		} else {
			log.info(`  Config object should look like this:

               ${green(`import { kitRoutes, type Options } from 'vite-plugin-kit-routes'
	
               export default {
                 // ...
               } satisfies Options`)}
`)
		}
		log.info('')
		log.info('You can specify a custom config file using --config with the following format:')
		log.info('  --config ./path/to/config.ts#named_export')
		log.info('  If no named export is specified, it will use the default export')
		log.info('')

		process.exit(1)
	}

	const success = await run(true, config)
	if (!success) {
		process.exit(1)
	}
}
```

Note: `loadConfig`, `loadConfigFromFile`, `exportName`, and the `version` resolution block above remain unchanged. Top-level `await` is fine - the file is an ESM module bin.

- [ ] **Step 2: Remove the commander dependency from `vite-plugin-kit-routes`**

In `packages/vite-plugin-kit-routes/package.json`, delete the line:

```json
		"commander": "catalog:tooling",
```

- [ ] **Step 3: Refresh install and rebuild kit-routes**

Run: `pnpm i && pnpm -F vite-plugin-kit-routes build`
Expected: build succeeds with no commander resolution.

- [ ] **Step 4: Run kit-routes tests + type check**

Run: `pnpm -F vite-plugin-kit-routes test:ci`
Expected: PASS.

Run: `pnpm -F vite-plugin-kit-routes check`
Expected: PASS. If the `values.config` type triggers an error, keep the cast shown in Step 1.

- [ ] **Step 5: Smoke-test the `kit-routes` CLI from built output**

Run: `node packages/vite-plugin-kit-routes/dist/esm/bin.js --version`
Expected: prints the version, exits 0.

Run: `node packages/vite-plugin-kit-routes/dist/esm/bin.js --help`
Expected: prints help including `sync` command; exits 0.

Run: `node packages/vite-plugin-kit-routes/dist/esm/bin.js sync` (from a dir with no config)
Expected: prints the "Config object should look like this" guidance and exits 1 (same behavior as before).

- [ ] **Step 6: Commit**

```bash
git add packages/vite-plugin-kit-routes/src/lib/bin.ts packages/vite-plugin-kit-routes/package.json pnpm-lock.yaml
git commit -m "refactor(kit-routes): replace commander with parseCli"
```

---

## Task 5: Remove commander from the catalog + final verification + changeset

**Files:**

- Modify: `pnpm-workspace.yaml`
- Create: `.changeset/drop-commander-node-util.md`

- [ ] **Step 1: Remove the catalog entry**

In `pnpm-workspace.yaml`, delete the `commander` line from the `tooling` catalog (the line `'commander': '14.0.0'`).

- [ ] **Step 2: Refresh install**

Run: `pnpm i`
Expected: completes; lockfile updated, `commander` removed.

- [ ] **Step 3: Verify zero commander references remain**

Run: `grep -rn "commander" packages pnpm-workspace.yaml --include="*.json" --include="*.ts" --include="*.js" --include="*.yaml"`
Expected: no output. (If `pnpm-lock.yaml` still references it, re-run `pnpm i`.)

- [ ] **Step 4: Full graph build + touched-package tests**

Run: `pnpm build`
Expected: success.

Run: `pnpm -F @kitql/helpers test:ci && pnpm -F vite-plugin-kit-routes test:ci`
Expected: all pass.

- [ ] **Step 5: Lint/format the changed files**

Run: `pnpm lint`
Expected: passes (or auto-fixable issues only). Run `pnpm format` if needed, then re-run `pnpm lint`.

- [ ] **Step 6: Add the changeset**

Create `.changeset/drop-commander-node-util.md`:

```md
---
'@kitql/helpers': minor
'@kitql/eslint-config': patch
'vite-plugin-kit-routes': patch
---

Replace `commander` with a built-in `node:util` CLI parser. `@kitql/helpers` now exposes a `parseCli` helper via the new `@kitql/helpers/server` export; the `kitql-lint` and `kit-routes` CLIs use it and no longer depend on `commander`.
```

- [ ] **Step 7: Commit**

```bash
git add pnpm-workspace.yaml pnpm-lock.yaml .changeset/drop-commander-node-util.md
git commit -m "chore: drop commander dependency from the catalog"
```

---

## Task 6: Document `parseCli` / `@kitql/helpers/server`

**Files:**

- Modify: `docs/src/content/docs/docs/tools/04_helpers.mdx`

- [ ] **Step 1: Add a `parseCli` section to the helpers docs**

Append this section to the end of `docs/src/content/docs/docs/tools/04_helpers.mdx`:

````mdx
## 🧩 parseCli (server-only)

A tiny wrapper around Node's built-in [`util.parseArgs`](https://nodejs.org/api/util.html#utilparseargsconfig) for building CLIs - no extra dependency. It lives under the `@kitql/helpers/server` entrypoint, so this node-only code never ends up in your browser bundle.

```ts
import { parseCli } from '@kitql/helpers/server'

const { values, positionals, help } = parseCli({
	name: 'my-cli',
	description: 'Do something useful',
	version: '1.0.0',
	allowPositionals: true,
	options: {
		format: { type: 'boolean', short: 'f', description: 'format files' },
		glob: { type: 'string', short: 'g', default: '.', description: 'file/dir/glob' },
	},
})

if (values.help) {
	console.info(help)
	process.exit(0)
}
```

- Applies your `default` values automatically.
- Registers `--help` (`-h`) and, when `version` is set, `--version`, so they never throw - you decide whether to print `help` and exit.
- Option names are returned exactly as declared (kebab-case stays kebab-case: `values['base-branch']`).
````

- [ ] **Step 2: Verify the docs page builds**

Run: `pnpm -F docs build`
Expected: build succeeds (no MDX/Astro errors). If the full docs build is too slow in this environment, instead confirm the file is valid MDX by eye and rely on CI.

- [ ] **Step 3: Commit**

```bash
git add docs/src/content/docs/docs/tools/04_helpers.mdx
git commit -m "docs(helpers): document parseCli and the /server entrypoint"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** wrapper (Task 1), `/server` subpath + build tooling (Task 2), eslint-config refactor + dep removal (Task 3), kit-routes refactor + dep removal (Task 4), catalog removal + verification + changeset (Task 5), public-API docs (Task 6). All spec sections covered.
- **Placeholders:** none - every code/command step is concrete.
- **Type consistency:** `parseCli`/`CliConfig`/`CliOption`/`CliResult` defined in Task 1 are used unchanged in Tasks 3-4; option keys (`diff-only`, `base-branch`, `config`) are read with the same kebab keys produced by the wrapper.

## Notes / risk reminders

- The `kit-routes` bin builds to `dist/esm/bin.js` (esm) and `dist/cjs/bin.js`; the package's `bin` mapping is unchanged - only the source changes.
- If `pnpm -F @kitql/eslint-config check` reports there is no `check` script, that is expected; rely on the smoke test instead.
- Keep `@kitql/helpers` main `index.ts` free of any `./server` re-export so browser consumers never pull `node:util`.
