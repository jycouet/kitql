# @kitql/handles

## 0.3.0-next.1

### Patch Changes

- Updated dependencies
  [[`26e0322`](https://github.com/jycouet/kitql/commit/26e0322b9dfb53002fbc9e2cfe22c38a4409cffd)]:
  - @kitql/helpers@0.8.13-next.0

## 0.3.0-next.0

### Minor Changes

- [#957](https://github.com/jycouet/kitql/pull/957)
  [`bbaf93d`](https://github.com/jycouet/kitql/commit/bbaf93dd95ff31dad4cbfbb25fd7261fb8d0c6ec)
  Thanks [@jycouet](https://github.com/jycouet)! - [BREAKING] - By default, don't remove
  "content-encoding" from response header. But you can pass a config function `tweakResponseHeaders`
  that can change any headers

  You can do something like this for example:

  ```ts
  tweakResponseHeaders(defaultResponseHeaders) {
    defaultResponseHeaders.delete('content-encoding')
    defaultResponseHeaders.delete('content-length')
    return defaultResponseHeaders
  }
  ```

## 0.2.4

### Patch Changes

- [`bc9f819`](https://github.com/jycouet/kitql/commit/bc9f819766727c059e8436e10f6d7b142c55346b)
  Thanks [@jycouet](https://github.com/jycouet)! - update package.json and publish it on npm (MIT)

- Updated dependencies
  [[`bc9f819`](https://github.com/jycouet/kitql/commit/bc9f819766727c059e8436e10f6d7b142c55346b)]:
  - @kitql/helpers@0.8.12

## 0.2.3

### Patch Changes

- Updated dependencies
  [[`4e157a5`](https://github.com/jycouet/kitql/commit/4e157a5b4fc057054b5c014d022839f99a59a311),
  [`13cc0c6`](https://github.com/jycouet/kitql/commit/13cc0c609ade1aa6e094bb98c666e8ee6ae894bb)]:
  - @kitql/helpers@0.8.11

## 0.2.1-next.0

### Patch Changes

- [#766](https://github.com/jycouet/kitql/pull/766)
  [`0b14bc8`](https://github.com/jycouet/kitql/commit/0b14bc87e67f88c9b016f3cc8124203c697690f2)
  Thanks [@jycouet](https://github.com/jycouet)! - rmv Content-Encoding in response of a proxied
  handle

## 0.2.0

### Minor Changes

- [#704](https://github.com/jycouet/kitql/pull/704)
  [`e2058bf`](https://github.com/jycouet/kitql/commit/e2058bf02531ef04719ef167f88cde9e7a1f3a4d)
  Thanks [@fnimick](https://github.com/fnimick)! - [BREAKING] `handleProxies` arguments have changed
  shape. (doc is up-to-date)

## 0.1.7

### Patch Changes

- [#697](https://github.com/jycouet/kitql/pull/697)
  [`4b7e636`](https://github.com/jycouet/kitql/commit/4b7e63689540f874ae8f284f380e03fa6ca82863)
  Thanks [@fnimick](https://github.com/fnimick)! - add new handles `handleCors`, `handleCsrf`, and
  utility `createCorsWrapper`

## 0.1.6

### Patch Changes

- [#647](https://github.com/jycouet/kitql/pull/647)
  [`75e0e9d`](https://github.com/jycouet/kitql/commit/75e0e9d7d50ae4c42c69a3321b681cf95076fe3c)
  Thanks [@jycouet](https://github.com/jycouet)! - log if multiple proxy match

## 0.1.5

### Patch Changes

- [#629](https://github.com/jycouet/kitql/pull/629)
  [`f474d6f`](https://github.com/jycouet/kitql/commit/f474d6f7b4a1aefefb5eed9dce98bec226ea0310)
  Thanks [@jycouet](https://github.com/jycouet)! - bump internals

## 0.1.4

### Patch Changes

- [`47d9f4d`](https://github.com/jycouet/kitql/commit/47d9f4d80d8f57556ace922b73d3a771d2e09e1c)
  Thanks [@jycouet](https://github.com/jycouet)! - tweak readme to explain that "KitQL is nothing"

## 0.1.3

### Patch Changes

- [#442](https://github.com/jycouet/kitql/pull/442)
  [`9f047fd`](https://github.com/jycouet/kitql/commit/9f047fdb99073cd1d1b2f02727330759b1dc25df)
  Thanks [@jycouet](https://github.com/jycouet)! - add types in package.json for cjs

## 0.1.2

### Patch Changes

- [#432](https://github.com/jycouet/kitql/pull/432)
  [`8e75e6d`](https://github.com/jycouet/kitql/commit/8e75e6d8f649e183d96577ed0280a9960ec13c0c)
  Thanks [@jycouet](https://github.com/jycouet)! - add cjs option

## 0.1.2-next.0

### Patch Changes

- [#432](https://github.com/jycouet/kitql/pull/432)
  [`8e75e6d`](https://github.com/jycouet/kitql/commit/8e75e6d8f649e183d96577ed0280a9960ec13c0c)
  Thanks [@jycouet](https://github.com/jycouet)! - add cjs option

## 0.1.1

### Patch Changes

- [#395](https://github.com/jycouet/kitql/pull/395)
  [`6a9ee8f`](https://github.com/jycouet/kitql/commit/6a9ee8f272ae3c7bea955fed36765373c18c5856)
  Thanks [@jycouet](https://github.com/jycouet)! - update doc link in npm

## 0.1.0

### Patch Changes

- [#384](https://github.com/jycouet/kitql/pull/384)
  [`e6ae461`](https://github.com/jycouet/kitql/commit/e6ae4610268c403c0526ec73bd91961f8dd819ea)
  Thanks [@jycouet](https://github.com/jycouet)! - export default

## 0.1.0-exp.1

### Patch Changes

- [#384](https://github.com/jycouet/kitql/pull/384)
  [`e6ae461`](https://github.com/jycouet/kitql/commit/e6ae4610268c403c0526ec73bd91961f8dd819ea)
  Thanks [@jycouet](https://github.com/jycouet)! - export default

## 0.1.0-exp.0

### Minor Changes

- [#374](https://github.com/jycouet/kitql/pull/374)
  [`2bc230a`](https://github.com/jycouet/kitql/commit/2bc230ab57566ab480fd1d945197f4ca86f091b0)
  Thanks [@jycouet](https://github.com/jycouet)! - new way to release & internal refacto

## 0.0.3

### Patch Changes

- [`50742f6`](https://github.com/jycouet/kitql/commit/50742f665886959d693111125e49944cc51be565)
  Thanks [@jycouet](https://github.com/jycouet)! - update package.json to be published

## 0.0.2

### Patch Changes

- [#346](https://github.com/jycouet/kitql/pull/346)
  [`8a01237`](https://github.com/jycouet/kitql/commit/8a01237e5d0ea5edb52e79b72296e887accd53d4)
  Thanks [@jycouet](https://github.com/jycouet)! - create light handlers
