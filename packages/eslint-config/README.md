# 👌 @kitql/lint-format

[![](https://img.shields.io/npm/v/@kitql/lint-format?color=&logo=npm)](https://www.npmjs.com/package/@kitql/lint-format)
[![](https://img.shields.io/npm/dm/@kitql/lint-format?&logo=npm)](https://www.npmjs.com/package/@kitql/lint-format)

##  📖 Read the doc

[![](https://img.shields.io/badge/Documentation%20of-kitql%20lint%20format-FF3E00.svg?style=flat&logo=stackblitz&logoColor=FF3E00)](https://kitql.dev/docs)

## Install

```bash
npm install @kitql/lint-format --D
```

### eslint config

`.eslintrc.js`
```js
module.exports = {
	extends: [
		'@kitql/lint-format',
	],
}
```

### prettier config

`.prettierrc.cjs`
```js
const config = require('./packages/lint-format/.prettierrc.cjs')

module.exports = {
  ...config,
  // Some custom things?
}

```

### usage

```bash
# lint
npm exec kitql-lint

# format
npm exec kitql-lint --format
```

##  ⭐️ Join us

[![GitHub Repo stars](https://img.shields.io/github/stars/jycouet/kitql?logo=github&label=KitQL&color=#4ACC31)](https://github.com/jycouet/kitql)

💡 _[KitQL](https://www.kitql.dev/docs) itself is not a library, it's "nothing" but a collection of standalone libraries._

