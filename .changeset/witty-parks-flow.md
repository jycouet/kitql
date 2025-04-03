---
'@kitql/handles': minor
---

[BREAKING] - By default, don't remove "content-encoding" from response header. But you can pass a
config function `tweakResponseHeaders` that can change any headers

You can do something like this for example:

```ts
tweakResponseHeaders(defaultResponseHeaders) {
  defaultResponseHeaders.delete('content-encoding')
  defaultResponseHeaders.delete('content-length')
  return defaultResponseHeaders
}
```
