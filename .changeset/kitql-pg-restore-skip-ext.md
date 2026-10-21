---
'@kitql/postgres': patch
---

`restore` of a `.dump` skips extensions the bundled PostgreSQL doesn't ship (e.g. `uuid-ossp`), with a warning
