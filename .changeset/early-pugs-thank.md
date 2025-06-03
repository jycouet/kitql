---
'vite-plugin-kit-routes': major
---

feat(kit-routes)!: Avoid escaping string and array default values

This change simplifies setting default values for path and search parameters.
Previously, you had to douple-escape a default string or array value. 
Now, you can simply set the default values like any other data type:

```diff
 kitRoutes({
   PAGES: {
     '/[org]/[project]/sessions': {
       explicit_search_params: {
-         timeFrame: { type: 'string', default: "'1d'" }
-         userId: { type: 'Array<string>', default: "['123', 'abc']" }
+         timeFrame: { type: 'string', default: '1d' }
+         userId: { type: 'Array<string>', default: ['123', 'abc'] }
       }
     }
   }
 })
```

This is a breaking change! To migrate to the new version, remove the quotes
to escape string and array values as shown in the example above.