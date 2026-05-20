# Drop commander, share a node:util CLI parser via `@kitql/helpers/server`

Date: 2026-05-20
Branch: `worktree-unify-cli-parser`

## Problem

`commander` is declared in two published packages and shipped twice:

| Package                  | File                                | Usage                                        | Introduced           |
| ------------------------ | ----------------------------------- | -------------------------------------------- | -------------------- |
| `@kitql/eslint-config`   | `cmd.js` (`kitql-lint` bin)         | 7 flat options                               | PR #554 (2023-12-12) |
| `vite-plugin-kit-routes` | `src/lib/bin.ts` (`kit-routes` bin) | `sync` subcommand + `--version` + `--config` | PR #965 (2025-04-11) |

It is pinned in the `tooling` catalog (`pnpm-workspace.yaml`, `commander@14.0.0`).

Note: `vite-plugin-watch-and-run` does **not** parse CLI args. It only `spawn(info.run, [], { shell })` a user command string (`src/lib/index.ts:199`). It is not part of this change.

Goal: remove the `commander` dependency entirely and parse args with Node's built-in `node:util` `parseArgs`, sharing one thin wrapper.

## Decisions (already agreed)

1. Replace `commander` with `node:util` `parseArgs` (zero runtime deps).
2. The thin wrapper lives in `@kitql/helpers` (both consumers already depend on it; both share only `@kitql/helpers`, not `@kitql/internals`).
3. Expose it through a dedicated **`@kitql/helpers/server`** subpath export, so node-only code never enters the browser module graph. (`@kitql/helpers` currently has zero `node:` imports and is browser-safe via `esm-env`.)

Rejected: putting the wrapper in `@kitql/internals` (would force `@kitql/eslint-config` to take internals' heavy deps: `oxc-parser`, `oxc-walker`, `esrap`, `svelte`).

## Design

### 1. New wrapper: `packages/helpers/src/lib/server/index.ts`

A thin, side-effect-free wrapper over `node:util` `parseArgs`. It does NOT call `process.exit` (keeps it testable); the caller decides what to do with `--help`/`--version`.

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
	args?: string[] // defaults to process.argv.slice(2)
}

export interface CliResult<C extends CliConfig> {
	values: Record<string, string | boolean | undefined>
	positionals: string[]
	help: string // generated usage text from name/description/options
}

export function parseCli<C extends CliConfig>(config: C): CliResult<C>
```

Behavior:

- Builds `node:util` options from `config.options` (passes only `type` + `short`).
- Defaults are applied by the wrapper itself after parsing (not via `node:util`'s `default`, which is not available across all Node >=18). For any option whose parsed value is `undefined`, the wrapper fills in `config.options[name].default`.
- Auto-registers a `help` boolean (`-h`) and, when `config.version` is set, a `version` boolean - so `node:util`'s strict mode does not throw on `--help`/`--version`. The wrapper does NOT print or exit; the caller checks `values.help` / `values.version` against the returned `help` string / version.
- `allowPositionals` passed through (kit-routes needs the `sync` positional).
- `help` is generated from `name`, `description`, and each option's `short`/`description`/`default`.
- Names stay as declared (kebab keys like `diff-only` are returned as `values['diff-only']`); consumers map to their own variable names.

Naming note: the exported function is `parseCli` (distinct from the `node:util` `parseArgs` builtin it wraps), imported from `@kitql/helpers/server`.

Re-export from `packages/helpers/src/lib/server/index.ts`; do NOT add it to `packages/helpers/src/lib/index.ts` (keep node-only code off the main/browser entry).

Test: `packages/helpers/src/lib/server/parseCli.spec.ts` (node env) covering boolean/string/short/default/positionals/help generation.

### 2. Build / packaging changes (subpath export)

The build is: `vite build` (SvelteKit app) -> `svelte-package` (ESM + types, mirrors `src/lib`) -> `scripts/package.js` (restructures `dist` into `dist/esm`, builds CJS via esbuild over every `src/lib` file).

- `src/lib/server/index.ts` -> svelte-package emits `dist/server/index.{js,d.ts}` -> moved to `dist/esm/server/index.{js,d.ts}`. esbuild emits `dist/cjs/server/index.js`. No build-loop changes needed; both tools already walk `src/lib` recursively.
- `scripts/packageJsonFormat.js` currently **overwrites** `exports` with a hard-coded `{ '.': {...} }` for every package. Change it to preserve per-package extra subpath exports: start from the standard `.` entry, then merge any non-`.` keys already present in the source `package.json` `exports`. Other packages (which declare none) are unaffected.
- `packages/helpers/package.json` source declares the extra export so the format script preserves it:

```json
"exports": {
  ".": { "types": "./esm/index.d.ts", "require": "./cjs/index.js", "svelte": "./esm/index.js", "default": "./esm/index.js" },
  "./server": { "types": "./esm/server/index.d.ts", "require": "./cjs/server/index.js", "default": "./esm/server/index.js" }
}
```

### 3. Refactor `@kitql/eslint-config/cmd.js`

Replace the seven `program.addOption(...)` + `program.parse` + `program.opts()` block with one `parseCli` call importing from `@kitql/helpers/server`. Keep existing local variable names by mapping kebab keys (`diff-only` -> `diffOnly`, `base-branch` -> `baseBranch`). Drop the `commander` import.

### 4. Refactor `vite-plugin-kit-routes/src/lib/bin.ts`

- Drop `import { Command } from 'commander'`.
- `parseCli` with `allowPositionals: true`, option `config` (`-c`).
- `sync` subcommand -> `positionals[0] === 'sync'`. Unknown/empty command -> print `help` and exit 1.
- `--version` -> existing version-reading code prints and exits 0 when `values.version` is set.
- Keep the existing rich "config object should look like this" guidance and the existing `run(true, config)` flow.

### 5. Remove `commander`

- Remove from `packages/eslint-config/package.json` dependencies.
- Remove from `packages/vite-plugin-kit-routes/package.json` dependencies.
- Remove the `commander` entry from the `tooling` catalog in `pnpm-workspace.yaml`.
- `pnpm i` to update the lockfile.

## Testing & verification

- `pnpm -F @kitql/helpers test` (new wrapper spec + existing browser/node specs still pass -> proves the main entry stays browser-safe).
- `pnpm -F @kitql/helpers build` then confirm `dist/esm/server/index.js`, `dist/cjs/server/index.js`, `dist/esm/server/index.d.ts` exist and `dist/package.json` exports include `./server`.
- `pnpm -F vite-plugin-kit-routes test` (existing CLI tests).
- `pnpm build` (whole graph) succeeds.
- Manual smoke: `kitql-lint --format`, `kitql-lint -d -b main`, `kit-routes sync`, `kit-routes --version`, `kit-routes --help`.
- Confirm no remaining `commander` references: `grep -rn commander packages pnpm-workspace.yaml`.

## Out of scope

- `vite-plugin-watch-and-run` (no CLI parsing).
- Adding `--help`/`--version` polish beyond current parity (eslint-config has no `--version` today; not adding one).

## Risks

- Subpath export touches shared build tooling (`packageJsonFormat.js`). Mitigated by merging rather than hard-coding, and verifying every package still formats to the same `.` map.
- `parseArgs` does not auto-generate help/subcommands; the small glue lives in each bin (acceptable - that glue is bin-specific anyway).

## Documentation

`parseCli` is new public API, so add a section to `docs/src/content/docs/docs/tools/04_helpers.mdx` documenting it and the `@kitql/helpers/server` entrypoint (fits the package's "ship less to the browser" story - node-only code stays out of the browser bundle).

## Changeset

Three packages change publicly:

- `@kitql/helpers`: minor (new `./server` export).
- `@kitql/eslint-config`: patch (internal CLI refactor, no behavior change).
- `vite-plugin-kit-routes`: patch (internal CLI refactor, no behavior change).
