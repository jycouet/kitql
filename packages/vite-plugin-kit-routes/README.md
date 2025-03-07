# 🪧 vite-plugin-kit-routes

[![](https://img.shields.io/npm/v/vite-plugin-kit-routes?color=&logo=npm)](https://www.npmjs.com/package/vite-plugin-kit-routes)
[![](https://img.shields.io/npm/dm/vite-plugin-kit-routes?&logo=npm)](https://www.npmjs.com/package/vite-plugin-kit-routes)

## 📖 Read the doc

[![](https://img.shields.io/badge/Documentation%20of-vite%20plugin%20kit%20routes-FF3E00.svg?style=flat&logo=stackblitz&logoColor=FF3E00)](https://kitql.dev/docs/tools/06_vite-plugin-kit-routes)

## ⚡️ Quick start

### Install

```bash
npm i -D vite-plugin-kit-routes
```

### Add to your Vite config

```js
import { sveltekit } from '@sveltejs/kit/vite'
import { kitRoutes } from 'vite-plugin-kit-routes'

/** @type {import('vite').UserConfig} */
export default config = {
	plugins: [
		sveltekit(),
		// ✅ Add the plugin
		kitRoutes()
	]
}
```

## Use

```html
<script lang="ts">
  import { route } from '$lib/ROUTES'
</script>

<a href={route('/about')}>About</a>
```

## ⭐️ Join us

[![GitHub Repo stars](https://img.shields.io/github/stars/jycouet/kitql?logo=github&label=KitQL&color=#4ACC31)](https://github.com/jycouet/kitql)

💡 _[KitQL](https://www.kitql.dev/docs) itself is not a library, it's "nothing" but a collection of
standalone libraries._
