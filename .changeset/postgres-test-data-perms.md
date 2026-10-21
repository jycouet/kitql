---
'@kitql/postgres': patch
---

`startTestServer()` on Linux / macOS: data dir set to 0700 (postgres refused 0755), template cluster built next to the cache (no cross-filesystem rename).
