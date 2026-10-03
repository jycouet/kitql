---
'@kitql/internals': patch
'vite-plugin-watch-and-run': patch
---

`esrap`, `oxc-parser`, `oxc-walker` (internals) and `picomatch` (watch-and-run) are `^` ranges instead of exact pins, so they dedupe with the app's own copies (e.g. svelte's `esrap`).
