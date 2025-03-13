---
'vite-plugin-stripper': minor
---

[BREAKING] - decorators now takes a specific object as config
You should now do something like this:
```ts
decorators: [
	{ decorator: 'BackendMethod' },
	{
		decorator: 'Entity',
		args_1: [
			{ fn: 'backendPrefilter' },
			{ fn: 'backendPreprocessFilter' },
			{ fn: 'sqlExpression' },
			{ 
				fn: 'dbName', 
				// excludeEntityKeys: ['users']
			}
		]
	}
]
```