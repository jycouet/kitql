---
'@kitql/eslint-config': patch
'@kitql/handles': patch
'@kitql/internals': patch
'vite-plugin-kit-routes': patch
'vite-plugin-stripper': patch
'vite-plugin-watch-and-run': patch
---

`@kitql/*` dependencies are published as a `^` range instead of an exact version, so an app using several kitql packages (directly or through firstly) installs a single copy of each.
