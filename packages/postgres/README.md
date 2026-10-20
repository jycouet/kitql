# 🐘 @kitql/postgres

[![](https://img.shields.io/npm/v/@kitql/postgres?color=&logo=npm)](https://www.npmjs.com/package/@kitql/postgres)
[![](https://img.shields.io/npm/dm/@kitql/postgres?&logo=npm)](https://www.npmjs.com/package/@kitql/postgres)

Local PostgreSQL for dev, as a dev dependency: no system install, no docker, no devbox. Works offline
once it is in your package manager store, on Windows, Linux (incl. WSL) and macOS.

- **One server per repo**, data in the main worktree (`.git/kitql-postgres`), on a fixed port.
- **One database per worktree**, `<repo>_<worktree>`, created on first `init`.

## 📖 Read the doc

[![](https://img.shields.io/badge/Documentation%20of-kitql%20postgres-FF3E00.svg?style=flat&logo=stackblitz&logoColor=FF3E00)](https://kitql.dev/docs/tools/11_postgres)

## Install

```bash
npm install @kitql/postgres -D
```

## Usage

```bash
kitql-postgres up              # start the repo server (foreground, Ctrl+C stops it)
kitql-postgres init            # create this worktree's db (idempotent, timezone UTC)
kitql-postgres url             # postgres://postgres:postgres@localhost:5432/myapp_main
kitql-postgres ls              # list databases (* = this worktree)
kitql-postgres clone main      # this worktree's db = copy of the `main` worktree db
kitql-postgres dump [file]     # pg_dump -Fc (default: <db>.dump)
kitql-postgres restore <file>  # .dump (pg_restore) or .sql (psql)
kitql-postgres drop            # drop this worktree's db
kitql-postgres psql -- -c "select 1"
kitql-postgres stop            # if the `up` terminal was killed
```

Options: `-d, --db <name>` targets another database, `-p, --port <port>` (on `up`, remembered),
`-f, --force` replaces an existing db on `clone` and closes open connections (`clone`, `drop`).

`clone` uses `CREATE DATABASE x TEMPLATE y`: it is instant, but nobody can be connected to the
source. Stop your dev server / psql first, or use `--force`.

## Binaries

PostgreSQL comes from [theseus-rs/postgresql-binaries](https://github.com/theseus-rs/postgresql-binaries),
shipped like esbuild: one `@kitql/postgres-<os>-<cpu>` package per platform, installed as
`optionalDependencies`. Nothing is downloaded at install or run time.

| Platform     | Package                        |
| ------------ | ------------------------------ |
| Windows x64  | `@kitql/postgres-win32-x64`    |
| Linux x64    | `@kitql/postgres-linux-x64`    |
| Linux arm64  | `@kitql/postgres-linux-arm64`  |
| macOS arm64  | `@kitql/postgres-darwin-arm64` |
| macOS x64    | `@kitql/postgres-darwin-x64`   |

To use another PostgreSQL (system one, other version), set `KITQL_PG_BIN=/path/to/postgres/bin`.

## Env

| Variable        | Default                       |                                   |
| --------------- | ----------------------------- | --------------------------------- |
| `KITQL_PG_BIN`  | the platform package          | folder with `pg_ctl`, `psql`, ... |
| `KITQL_PG_HOME` | `<main worktree>/.git/kitql-postgres` | data dir, log & settings  |
| `DEBUG`         |                               | show stack traces                 |

## Contributing: platform packages

They are generated (not committed) and published outside changesets, as their version follows
PostgreSQL (`18.6.1`), not `@kitql/postgres`:

```bash
pnpm -F @kitql/postgres platforms                      # current platform, used by the workspace
pnpm -F @kitql/postgres platforms --target all --publish
```

To bump PostgreSQL: update `PG_VERSION` in `src/platforms.js` and the `postgres` catalog in
`pnpm-workspace.yaml`, publish the platform packages, then release `@kitql/postgres` with a changeset.
