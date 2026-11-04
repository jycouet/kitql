---
'@kitql/postgres': minor
---

Monorepo apps: a `kitql-pg` field in an app's package.json gives it its own db, web ports and `.env`. `.env.local` is synced too, `db` accepts dashes. `clone <worktree>` finds its db when `db` is set.
