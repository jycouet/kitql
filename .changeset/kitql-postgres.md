---
'@kitql/postgres': minor
---

New package: local PostgreSQL for dev (`kitql-pg` CLI). One server per repo on its own port (`package.json` `"kitql-pg": { "port": 5435 }`), worktrees use main's database by default and get their own with `kitql-pg clone main`. Optional per-worktree dev server ports (`"web"`), and `kitql-pg status [--json]` tells what a worktree uses. PostgreSQL binaries are downloaded once on first use into a per-user cache (sha256 pinned), then everything works offline.
