---
'@kitql/eslint-config': minor
---

add oxfmt support and richer oxlint ruleset

- new `oxfmt` tool option for `kitql-lint` (when enabled, prettier auto-restricts to `.svelte` files since oxfmt can't parse them yet)
- ship default `.oxfmtrc.json` with sortImports groups (kitql, sveltekit, aliases)
- expand `.oxlintrc.json`: `@e18e/eslint-plugin` + `eslint-plugin-depend`, `correctness` category at error level, explicit e18e/* rules, `@typescript-eslint/prefer-find` / `prefer-readonly` / `prefer-regexp-exec`, TS file overrides (`no-var`, `prefer-const`, `prefer-rest-params`, `prefer-spread`)
- new eslint option `kitql({ oxlint: { enable: true } })` to integrate `eslint-plugin-oxlint` and skip rules already covered by oxlint
- fix: `runOxc` now respects `--prefix` (so `-p pnpm` applies to oxlint too)
