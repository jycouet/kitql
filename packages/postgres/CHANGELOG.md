# @kitql/postgres

## 0.2.2

### Patch Changes

- [#1361](https://github.com/jycouet/kitql/pull/1361) [`44a2b2e`](https://github.com/jycouet/kitql/commit/44a2b2e8a1b0db770b85813d336f5b664eb7eda6) Thanks [@jycouet](https://github.com/jycouet)! - `restore` of a `.dump` skips extensions the bundled PostgreSQL doesn't ship (e.g. `uuid-ossp`), with a warning

## 0.2.1

### Patch Changes

- [#1355](https://github.com/jycouet/kitql/pull/1355) [`1166354`](https://github.com/jycouet/kitql/commit/11663540d83567c50f57137ad997ff8fb6576435) Thanks [@jycouet](https://github.com/jycouet)! - `startTestServer()` on Linux / macOS: data dir set to 0700 (postgres refused 0755), template cluster built next to the cache (no cross-filesystem rename).

## 0.2.0

### Minor Changes

- [#1353](https://github.com/jycouet/kitql/pull/1353) [`edd90b6`](https://github.com/jycouet/kitql/commit/edd90b68309bec84a85549ad82c1e0328d7929b3) Thanks [@jycouet](https://github.com/jycouet)! - `startTestServer()` from `@kitql/postgres/test`: a throwaway server for a test run (temp data dir, free port, `fsync = off`), started from a cached template cluster.

## 0.1.0

### Minor Changes

- [#1349](https://github.com/jycouet/kitql/pull/1349) [`1f1cf7a`](https://github.com/jycouet/kitql/commit/1f1cf7a5c214ae9c350f75658ab1863b8486270d) Thanks [@jycouet](https://github.com/jycouet)! - New package: local PostgreSQL for dev (`kitql-pg` CLI). One server per repo on its own port (`package.json` `"kitql-pg": { "port": 5435 }`), worktrees use main's database by default and get their own with `kitql-pg clone main`. Optional per-worktree dev server ports (`"web"`), and `kitql-pg status [--json]` tells what a worktree uses. PostgreSQL binaries are downloaded once on first use into a per-user cache (sha256 pinned), then everything works offline.
