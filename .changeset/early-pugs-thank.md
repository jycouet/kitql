---
'vite-plugin-kit-routes': major
---

feat!: Avoid requiring string default values to be quoted

This change simplifies setting default values for path and search parameters.
Previously, you had to douple-escape a default string value. 
Now, you can simply set a string default value like any other data type:

```diff
 kitRoutes({
   PAGES: {
     '/[org]/[project]/sessions': {
       explicit_search_params: {
-         timeFrame: { type: 'string', default: "'1d'" }
+         timeFrame: { type: 'string', default: '1d' }
       }
     }
   }
 })
```
