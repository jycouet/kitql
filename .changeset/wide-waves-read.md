---
'vite-plugin-stripper': minor
---

You should STOP using `decorators` and `hard` in favor of using the new `strip` config!
```ts
strip: [
	{ decorator: 'BackendMethod' },
	{
		decorator: 'Entity',
		args_1: [
			{ fn: 'backendPrefilter' },
			{ fn: 'backendPreprocessFilter' },
			{ fn: 'sqlExpression' },
			// { 
			// 	fn: 'saved', 
			// 	excludeEntityKeys: ['users']
			// }
		]
	}
]
```
