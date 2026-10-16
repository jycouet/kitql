---
'@kitql/eslint-config': minor
---

BREAKING: prettier is dropped, `kitql-lint` formats with `oxfmt` (every file type, incl. `.svelte`) and defaults to `eslint` + `oxfmt`. The shipped `.oxfmtrc.json` enables `svelte` and `sortTailwindcss`, and groups `remult`, `firstly` imports like the old prettier config. `kitql-lint` reads `oxfmt.config.ts` first, then `.oxfmtrc.json`. Peer dependencies are `^` ranges instead of exact versions.
