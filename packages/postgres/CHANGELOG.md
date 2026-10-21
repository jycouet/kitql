# @kitql/postgres

## 0.1.0

### Minor Changes

- [#1349](https://github.com/jycouet/kitql/pull/1349) [`1f1cf7a`](https://github.com/jycouet/kitql/commit/1f1cf7a5c214ae9c350f75658ab1863b8486270d) Thanks [@jycouet](https://github.com/jycouet)! - New package: local PostgreSQL for dev (`kitql-pg` CLI). One server per repo on its own port (`package.json` `"kitql-pg": { "port": 5435 }`), worktrees use main's database by default and get their own with `kitql-pg clone main`. Optional per-worktree dev server ports (`"web"`), and `kitql-pg status [--json]` tells what a worktree uses. PostgreSQL binaries are downloaded once on first use into a per-user cache (sha256 pinned), then everything works offline.
