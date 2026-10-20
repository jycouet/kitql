# 🐘 @kitql/postgres

[![](https://img.shields.io/npm/v/@kitql/postgres?color=&logo=npm)](https://www.npmjs.com/package/@kitql/postgres)
[![](https://img.shields.io/npm/dm/@kitql/postgres?&logo=npm)](https://www.npmjs.com/package/@kitql/postgres)

Local PostgreSQL for dev, as a dev dependency: no system install, no docker, no devbox. Works on
Windows, Linux (incl. WSL) and macOS, offline after the first run.

- **One server per repo**: data in the main worktree (`.git/kitql-postgres`), on its own port.
  Run as many projects side by side as you want (5432, 5433, ...).
- **One database per worktree**: `<repo>_<worktree>`, created on first `init`.

## 📖 Read the doc

[![](https://img.shields.io/badge/Documentation%20of-kitql%20postgres-FF3E00.svg?style=flat&logo=stackblitz&logoColor=FF3E00)](https://kitql.dev/docs/tools/11_postgres)

## Install

```bash
npm install @kitql/postgres -D
```

## Usage

```bash
kitql-pg up              # start the repo server (foreground, Ctrl+C stops it)
kitql-pg up --port 5433  # another project? pick another port (remembered)
kitql-pg init            # create this worktree's db (idempotent, timezone UTC)
kitql-pg url             # postgres://postgres:postgres@localhost:5432/myapp_main
kitql-pg ls              # list databases (* = this worktree)
kitql-pg clone main      # this worktree's db = copy of the `main` worktree db
kitql-pg dump [file]     # pg_dump -Fc (default: <db>.dump)
kitql-pg restore <file>  # .dump (pg_restore) or .sql (psql)
kitql-pg drop            # drop this worktree's db
kitql-pg psql -- -c "select 1"
kitql-pg stop            # if the `up` terminal was killed
```

Options: `-d, --db <name>` targets another database, `-p, --port <port>` (on `up`, remembered),
`-f, --force` replaces an existing db on `clone` and closes open connections (`clone`, `drop`).

`clone` uses `CREATE DATABASE x TEMPLATE y`: it is instant, but nobody can be connected to the
source. Stop your dev server / psql first, or use `--force`.

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
