# 👌 @kitql/eslint-config

[![](https://img.shields.io/npm/v/@kitql/eslint-config?color=&logo=npm)](https://www.npmjs.com/package/@kitql/eslint-config)
[![](https://img.shields.io/npm/dm/@kitql/eslint-config?&logo=npm)](https://www.npmjs.com/package/@kitql/eslint-config)

## 📖 Read the doc

[![](https://img.shields.io/badge/Documentation%20of-kitql%20lint%20format-FF3E00.svg?style=flat&logo=stackblitz&logoColor=FF3E00)](https://kitql.dev/docs/tools/08_eslint-config)

## Install

```bash
npm install @kitql/eslint-config --D
```

### tools

`kitql-lint` orchestrates optional tools - install only what you want to use:

| Tool      | What it does                                              |
| --------- | --------------------------------------------------------- |
| eslint    | Linter (svelte rules, pnpm catalog rules, custom rules)   |
| oxfmt     | Formatter (Rust); every file type, incl. `.svelte`        |
| oxlint    | Faster linter (Rust); covers most JS/TS rules             |
| tsgolint  | Type-aware lint rules for oxlint                          |

By default `kitql-lint` runs `eslint` + `oxfmt`. Pick others with `-t`:

```bash
kitql-lint                                  # eslint + oxfmt (default)
kitql-lint -t oxlint,tsgolint,oxfmt,eslint  # 🦀 add oxlint + type-aware (recommended)
kitql-lint -t oxlint,tsgolint,oxfmt         # 🦀 pure oxc (no .svelte linting)
```

For the svelte combo, enable oxlint integration in eslint to avoid duplicate work on `.ts/.js`:

```js
// eslint.config.js
import { kitql } from '@kitql/eslint-config'

export default [...kitql({ oxlint: { enable: true } })]
```

oxfmt formats `.svelte` (needs `svelte` installed) and sorts imports + tailwind classes.

### eslint config

`eslint.config.js`

```js
import { kitql } from '@kitql/eslint-config'

export default [...kitql()]
```

### oxlint config

`.oxlintrc.json`

```jsonc
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@kitql/eslint-config/.oxlintrc.json"],
  "rules": {}
}
```

### oxfmt config

`.oxfmtrc.json` - copy from
[`@kitql/eslint-config/.oxfmtrc.json`](./.oxfmtrc.json) (oxfmt has no `extends` yet).

Tweak it in your app: edit your copy. Common ones:

- extra import groups: add a `customGroups` entry (glob on the import source) and place its
  `groupName` in `groups`, e.g. `{ "groupName": "remult", "elementNamePattern": ["remult", "remult/**"] }`
- tailwind v4 custom classes: `"sortTailwindcss": { "stylesheet": "./src/app.css" }` (relative to
  the config file)
- per-file options: `overrides`

All options: `node_modules/oxfmt/configuration_schema.json` (autocompleted via `$schema`).

### ignore things with

`.prettierignore` (read by oxfmt and by the eslint config; the name stays for compatibility)

```bash
.DS_Store
node_modules
/build
/.svelte-kit
/package
.env
.env.*
!.env.example

# Ignore files for PNPM, NPM and YARN
pnpm-lock.yaml
package-lock.json
yarn.lock

# Ignore files that are project specific
/db
```

### usage

```bash
# lint
npm exec kitql-lint

# format
npm exec kitql-lint --format
```

## ⭐️ Join us

[![GitHub Repo stars](https://img.shields.io/github/stars/jycouet/kitql?logo=github&label=KitQL&color=#4ACC31)](https://github.com/jycouet/kitql)

💡 _[KitQL](https://www.kitql.dev/docs) itself is not a library, it's "nothing" but a collection of
standalone libraries._
