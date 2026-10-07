---
'@kitql/eslint-config': patch
---

`kitql-lint -d` skips changed paths that are not files (e.g. a symlink to a directory), so eslint no longer fails the run on them.
