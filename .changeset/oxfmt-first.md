---
'@kitql/eslint-config': minor
---

`kitql-lint` defaults to `eslint` + `oxfmt`; oxfmt now formats `.svelte` too, so prettier no longer gets restricted to svelte files. The shipped `.oxfmtrc.json` enables `svelte` and `sortTailwindcss`. BREAKING: prettier and its plugins are optional peers, install them yourself to keep `-t prettier`.
