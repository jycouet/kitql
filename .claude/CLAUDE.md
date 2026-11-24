# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm i

# Build all packages (except docs)
pnpm build

# Lint / format
pnpm lint
pnpm format

# Run tests for a specific package
pnpm -F @kitql/helpers test
pnpm -F vite-plugin-kit-routes test

# Run tests with coverage (CI mode)
pnpm -F @kitql/helpers test:ci

# Type check a package
pnpm -F @kitql/helpers check

# Dev server for a package
pnpm -F @kitql/helpers dev

# Docs dev server (Astro Starlight)
pnpm -F docs dev
```

## Architecture

pnpm monorepo (`packages/*` + `docs`). Versions are centralized in `pnpm-workspace.yaml` catalogs.

### Package dependency graph

```
@kitql/helpers          (zero deps - foundation layer)
  |-> @kitql/internals  (+ oxc-parser, oxc-walker, esrap for AST)
  |-> @kitql/handles    (+ esm-env, vary - SvelteKit hooks)
  |-> @kitql/sveltekit  (deprecated, points to firstly)
  |-> vite-plugin-watch-and-run  (+ picomatch)
  |     |-> vite-plugin-stripper (+ @kitql/internals)
  |     |-> vite-plugin-kit-routes (+ @kitql/internals)
  |-> @kitql/eslint-config (kitql-lint CLI - eslint + oxfmt + oxlint)
  |-> @kitql/postgres   (kitql-pg CLI - local Postgres, one db per worktree)
```

### Build system

`scripts/package.js` orchestrates builds: vite build (ESM) -> svelte-package -> esbuild (CJS). `scripts/packageJsonFormat.js` enforces standardized package.json fields and exports maps.

Each package ships ESM + CJS + Svelte + TypeScript types. `publishConfig.directory: dist`.

### Releases

Changesets-based: `pnpm release:version` to version, `pnpm release` to build + publish. CI auto-creates release PRs on push to main.

npm auth is trusted publishing (OIDC, `id-token: write`), no `NPM_TOKEN`. `changesets/action` v2 requires `@changesets/cli` v3: bump them together and check action input names against its changelog.

### Linting

`kitql-lint` CLI (from `@kitql/eslint-config`) wraps eslint, oxfmt, oxlint, and tsgolint. Root `eslint.config.js` imports from the eslint-config package directly.

### Key conventions

- `@kitql/helpers` must remain zero-dependency
- `all-in` package is deprecated (private, do not modify)
- Published packages support SvelteKit 2 and 3 (`svelte-dep` catalog); the repo itself builds and tests on one Kit version only
- CI matrix tests each package independently (lint, check, test:ci)
