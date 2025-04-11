# 👌 @kitql/eslint-config

[![](https://img.shields.io/npm/v/@kitql/eslint-config?color=&logo=npm)](https://www.npmjs.com/package/@kitql/eslint-config)
[![](https://img.shields.io/npm/dm/@kitql/eslint-config?&logo=npm)](https://www.npmjs.com/package/@kitql/eslint-config)

## 📖 Read the doc

[![](https://img.shields.io/badge/Documentation%20of-kitql%20lint%20format-FF3E00.svg?style=flat&logo=stackblitz&logoColor=FF3E00)](https://kitql.dev/docs/tools/08_eslint-config)

## Install

```bash
npm install @kitql/eslint-config --D
```

### eslint config

`.eslint.config.js`

```js
import { kitql } from '@kitql/eslint-config'

export default [...kitql()]
```

### prettier config

`.prettierrc.cjs`

```js
import { kitql } from './packages/eslint-config/.prettierrc.cjs'

export default {
  ...kitql(),
  // Some custom things?
}
```

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
