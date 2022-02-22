# KitQL

[KitQL](https://github.com/jycouet/kitql#kitql), _A set of tools, helping **you** building efficient apps in a fast way._

<p align="center">
  <img src="./logo.svg" width="100" />
</p>

## 🌐 Infos

- Day by day progress, check [twitter - jycouet](https://twitter.com/jycouet/status/1486052645567672324)
- Video explanations, check [Youtube - KitQL - The native SvelteKit library for GraphQL](https://www.youtube.com/watch?v=6pH4fnFN70w)

## 👷 Quality

[![Release](https://github.com/jycouet/kitql/actions/workflows/release.yml/badge.svg)](https://github.com/jycouet/kitql/actions/workflows/release.yml)
[![Tests](https://github.com/jycouet/kitql/actions/workflows/ci.yml/badge.svg)](https://github.com/jycouet/kitql/actions/workflows/ci.yml)
![check-code-coverage](https://img.shields.io/badge/code--coverage-82.35%25-green)

|                                                                                                                    |                                                                                                          Coverage by package |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------: |
| [KitQL - graphql-codegen](https://github.com/jycouet/kitql/tree/main/packages/graphql-codegen)                     |                       ![check-code-coverage-graphql-codegen](https://img.shields.io/badge/graphql--codegen-100.0%25-success) |
| [KitQL - helper](https://github.com/jycouet/kitql/tree/main/packages/helper)                                       |                                          ![check-code-coverage-helper](https://img.shields.io/badge/helper-100.0%25-success) |
| [KitQL - vite-plugin-watch-and-run](https://github.com/jycouet/kitql/tree/main/packages/vite-plugin-watch-and-run) | ![check-code-coverage-vite-plugin-watch-and-run](https://img.shields.io/badge/vite--plugin--watch--and--run-57.66%25-yellow) |

# ⚡How to start?

You have 3 main options to use `KitQL`:

- Take a [Demo App](#demo-1) and tweak it to your needs
- Follow the [KitQL - all-in](https://github.com/jycouet/kitql/tree/main/packages/all-in) guide (easy)
- Pick and choose the tools you need (advanced)
  - [KitQL - client](https://github.com/jycouet/kitql/tree/main/packages/client)
  - [KitQL - graphql-codegen](https://github.com/jycouet/kitql/tree/main/packages/graphql-codegen)
  - [KitQL - vite-plugin-watch-and-run](https://github.com/jycouet/kitql/tree/main/packages/vite-plugin-watch-and-run)

<br /><br />

# ✨ All Demos _(ok only one for now)_

## Demo 1

_SvelteKit & GraphQL client with SSR & caching_

_Notes:_

- I'm using [volta](https://volta.sh/) as node manager.
  - If you have it, when you will run `yarn` (to install everything), volta will grab the version of node and yarn specified in the `package.json`.
  - If you don't have it, you will have to install node (>=16) and yarn (or other package managers) yourself.
- I'm using `yarn` as package manager.
  - In `yarn.lock` you are able to see pinned versions of dependencies. _(I'm trying to be always up to date)_
  - You can use other package managers, but you will need to adapt some scripts (`prepare` and the `watchAndRun` vite plugin.)

```bash
# Get the first demo app (will create a folder: kitql-demo1)
npx degit github:jycouet/kitql/examples/demo1 kitql-demo1

# Navigate to the new folder
cd kitql-demo1

# Install everything
yarn

# Run the app ⚡⚡⚡
yarn dev
```

<br /><br />

# ⚒️ Tools involved

- ✅ [SvelteKit](https://kit.svelte.dev/)
- ✅ [GraphQL](https://graphql.org/)
- ✅ [GraphQL - Yoga](https://www.graphql-yoga.com/)
- ✅ [GraphQL - CodeGen](https://www.graphql-code-generator.com/)

<br /><br />

# 🆓 License

[![GitHub license](https://img.shields.io/badge/license-MIT-gree.svg)](./LICENSE)

## ✨ Contributors

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="http://www.dynamicprocess.io"><img src="https://avatars.githubusercontent.com/u/5312607?v=4?s=100" width="100px;" alt=""/><br /><sub><b>JYC</b></sub></a><br /><a href="https://github.com/jycouet/kitql/commits?author=jycouet" title="Code">💻</a> <a href="https://github.com/jycouet/kitql/commits?author=jycouet" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
