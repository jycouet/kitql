---
'@kitql/postgres': minor
---

New package: local PostgreSQL for dev (`kitql-pg` CLI). One server per repo, one database per worktree. PostgreSQL binaries are downloaded once on first use into a per-user cache (sha256 pinned), then everything works offline.
