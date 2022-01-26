# KitQL - vite-plugin-watch-and-run

[KitQL](https://github.com/jycouet/kitql#kitql), _A set of tools, helping **you** building efficient apps in a fast way._

<p align="center">
  <img src="../../logo.svg" width="100" />
</p>

# ⚡How to - vite-plugin-watch-and-run

In your `svelte.config.js` add a watchAndRun with the following configuration:

- watch: a glob pattern to watch for changes
- a run command to run when a file change is detected

_(for now it's only codegen, but later it will be more!)_

```js
import watchAndRun from './vite-plugin-watch-and-run.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		vite: {
			plugins: [
				watchAndRun({
					watch: '*.+(gql|graphql)',
					run: 'yarn gen'
					// delay: 1000, Optional parameter to delay the run command.
				})
			]
		}
	}
};

export default config;
```

`delay` is good in case you have 200 files added realy fast! Like this the cmd is executed only once.
