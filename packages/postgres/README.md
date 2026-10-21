# 🐘 @kitql/postgres

[![](https://img.shields.io/npm/v/@kitql/postgres?color=&logo=npm)](https://www.npmjs.com/package/@kitql/postgres)
[![](https://img.shields.io/npm/dm/@kitql/postgres?&logo=npm)](https://www.npmjs.com/package/@kitql/postgres)

Local PostgreSQL for dev, as a dev dependency: no system install, no docker, no devbox. Works on
Windows, Linux (incl. WSL) and macOS, offline after the first run.

- **One server per repo**, on its own port (committed in `package.json`, see below): data in the
  main worktree (`.git/kitql-postgres`). Run as many projects side by side as you want.
- **Worktrees share main's database** (`<repo>`) by default. When one needs its own
  (migration, destructive test...), `kitql-pg clone main` gives it `<repo>_<worktree>`, and points
  its `.env` to it.

## 📖 Read the doc

[![](https://img.shields.io/badge/Documentation%20of-kitql%20postgres-FF3E00.svg?style=flat&logo=stackblitz&logoColor=FF3E00)](https://kitql.dev/docs/tools/11_postgres)

## Install

```bash
npm install @kitql/postgres -D
```

```jsonc
// package.json: the port of this project, for the whole team (default: 5432)
// optional: "db", main's database (default: named after the origin remote, `my.app` -> `my_app`)
// optional: "web", main's dev server port (worktrees get the next ones), "links" shown by status
"kitql-pg": { "port": 5435, "web": 5173, "links": ["/?login-as=admin"] }
```

## Usage

```bash
kitql-pg up              # start the repo server (foreground, Ctrl+C stops it), from any worktree
kitql-pg init            # create main's db (idempotent, timezone UTC; --tz Europe/Paris)
kitql-pg url             # postgres://postgres:postgres@localhost:5435/myapp
kitql-pg status [--json] # web port, db, links, logs of this worktree, and the other worktrees
kitql-pg ls              # list databases (* = the one this worktree uses)
kitql-pg restore <file>  # .dump (pg_restore) or .sql (psql), all or nothing
kitql-pg dump [file]     # pg_dump -Fc zstd (default: <db>.dump)
kitql-pg psql -- -c "select 1"
kitql-pg stop            # if the `up` terminal was killed

# in a worktree that needs its own db
kitql-pg clone main      # myapp_<worktree> = copy of main's db, .env DATABASE_URL updated
kitql-pg restore <file> --own  # or: its own db from a dump
kitql-pg drop            # drop it, back to main's db (.env updated)
```

Every command targets the database the worktree uses: its own one if it exists, else main's.
`-d, --db <name>` targets another one, `-o, --own` the worktree's own one. Other options:
`-p, --port <port>` (on `up`: local override of the package.json port, remembered), `--tz <zone>`
(on `init`), `-f, --force` replaces an existing db on `clone` and closes open connections
(`clone`, `drop`).

`clone` uses `CREATE DATABASE x TEMPLATE y STRATEGY FILE_COPY`: nobody can be connected to the
source. Stop your dev server / psql first, or use `--force`.

With `"web"` set, every worktree gets its own dev server port (main: `web`, the others the next free
ones, kept). `status` and `up` write it in the worktree `.env` `ORIGIN` (only a localhost one): the
dev server must read its port there.

## Tests

`startTestServer()` starts a throwaway server for a test run: same binaries, a temp data dir, a
free port, no durability (`fsync = off`). The first run makes a template cluster (~4s on Windows),
the next ones copy it (~0.6s). `stop()` deletes everything, and a run killed before stopping is
cleaned up by the next one.

```ts
// vitest config: test.globalSetup: ['./postgres.globalSetup.ts']
import { startTestServer } from '@kitql/postgres/test'

export default async function setup() {
	const server = await startTestServer()
	process.env.TEST_DATABASE_URL = server.url() // workers inherit it
	return () => server.stop()
}
```

Each worker / test file then creates its own database on it
(`CREATE DATABASE x STRATEGY FILE_COPY`).

## Speed

The server is tuned for dev (`wal_level = minimal`, `synchronous_commit = off`, bigger WAL and
`maintenance_work_mem`; `fsync` stays on, so no corruption risk). On Windows, for a 680 MB
database (3M rows, 4 indexes, 1 FK):

| Command   | Time | Plain PostgreSQL defaults |
| --------- | ---- | ------------------------- |
| `dump`    | 6s   | 24s (gzip)                |
| `restore` | 22s  | 36s                       |
| `clone`   | 7s   | 22s                       |

## Binaries

On first use, `kitql-pg` downloads PostgreSQL 18.6 from
[theseus-rs/postgresql-binaries](https://github.com/theseus-rs/postgresql-binaries) for your
platform (`win32-x64`, `linux-x64`, `linux-arm64`, `darwin-arm64`, `darwin-x64`), checks its
sha256 (pinned in the package), strips what a dev server does not need and keeps it in a per-user
cache shared by all your projects. After that, everything works offline.

Only the binaries are shared: every repo keeps its own server, data and port.

## Env

| Variable         | Default                                     |                                  |
| ---------------- | ------------------------------------------- | -------------------------------- |
| `KITQL_PG_BIN`   | the cached download                         | use another install's `bin`      |
| `KITQL_PG_CACHE` | `%LOCALAPPDATA%` / `~/Library/Caches` / `~/.cache` + `/kitql-postgres` | binaries cache |
| `KITQL_PG_HOME`  | `<main worktree>/.git/kitql-postgres`       | data dir, log & settings         |
| `DEBUG`          |                                             | show stack traces                |
