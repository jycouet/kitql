# KitQL

[KitQL](https://github.com/jycouet/kitql#kitql), _A set of tools, helping **you** building efficient apps in a fast way._

<p align="center">
  <img src="./logo.svg" width="100" />
</p>

🚧🚧🚧🚧🚧🚧🚧🚧🚧

UNDER CONSTRUCTION

- Day by day progress, check [twitter - jycouet](https://twitter.com/jycouet/status/1486052645567672324)
- Video explanations, check [Youtube - KitQL - The native SvelteKit library for GraphQL](https://www.youtube.com/watch?v=6pH4fnFN70w)

🚧🚧🚧🚧🚧🚧🚧🚧🚧

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
