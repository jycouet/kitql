---
'@kitql/eslint-config': minor
---

New rule: ban `!import.meta.env.SSR`. Wrap server-only code in `if (import.meta.env.SSR) { ... } throw new Error(...)` instead, so Vite drops it (and its imports) from the client bundle.
