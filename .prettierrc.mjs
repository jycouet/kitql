import { kitql } from './packages/eslint-config/.prettierrc.mjs'

export default {
	...kitql(),
	// Some custom things?
}

// The astro config was: (if needed at some point!)
// {
// 	"plugins": ["prettier-plugin-astro"],
// 	"overrides": [
// 		{
// 			"files": "*.astro",
// 			"options": {
// 				"parser": "astro"
// 			}
// 		}
// 	],
// 	"semi": false,
// 	"singleQuote": true,
// 	"tabWidth": 2,
// 	"printWidth": 100
// }
