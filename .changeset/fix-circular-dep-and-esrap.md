---
'@kitql/eslint-config': patch
'@kitql/internals': patch
'@kitql/helpers': patch
---

break the `@kitql/helpers` <-> `@kitql/eslint-config` workspace dependency cycle, and make sure `esrap` ships as a pinned version (no `pkg.pr.new` url)
