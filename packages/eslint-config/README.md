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

`kitql-lint` orchestrates four optional tools - install only what you want to use:

| Tool      | What it does                                              |
| --------- | --------------------------------------------------------- |
| eslint    | Linter (svelte rules, pnpm catalog rules, custom rules)   |
| prettier  | Formatter (every file type, incl. `.svelte`)              |
| oxlint    | Faster linter (Rust); covers most JS/TS rules             |
| oxfmt     | Faster formatter (Rust); doesn't speak `.svelte` yet      |

By default `kitql-lint` runs `eslint` + `prettier`. Pick others with `-t`:

```bash
kitql-lint                                            # eslint + prettier (default)
kitql-lint -t eslint,prettier,oxlint,tsgolint         # add oxlint + type-aware
kitql-lint -t oxlint,tsgolint,oxfmt,eslint,prettier   # 🦀 svelte + full oxc (recommended)
kitql-lint -t oxlint,tsgolint,oxfmt                   # 🦀 pure oxc (no .svelte support)
```

For the svelte combo, enable oxlint integration in eslint to avoid duplicate work on `.ts/.js`:

```js
// eslint.config.js
import { kitql } from '@kitql/eslint-config'

export default [...kitql({ oxlint: { enable: true } })]
```

When `oxfmt` is in the tool set, `prettier` auto-restricts to `**/*.svelte` (oxfmt can't parse
svelte yet); `oxfmt` handles every other file type.

### eslint config

`eslint.config.js`

```js
import { kitql } from '@kitql/eslint-config'

export default [...kitql()]
```

### prettier config

`.prettierrc.js`

```js
import { kitql } from '@kitql/eslint-config/.prettierrc.js'

export default {
  ...kitql(),
  // Some custom things?
}
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

### ignore things with

`.prettierignore`

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
