---
'@kitql/helpers': minor
'@kitql/eslint-config': patch
'vite-plugin-kit-routes': patch
---

Replace `commander` with a built-in `node:util` CLI parser. `@kitql/helpers` now exposes a `parseCli` helper via the new `@kitql/helpers/server` export; the `kitql-lint` and `kit-routes` CLIs use it and no longer depend on `commander`.
