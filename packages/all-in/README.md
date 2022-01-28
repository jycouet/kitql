# KitQL - all-in

[KitQL](https://github.com/jycouet/kitql#kitql), _A set of tools, helping **you** building efficient apps in a fast way._

<p align="center">
  <img src="../../logo.svg" width="100" />
</p>

# ⚡How to - all-in

## 1️⃣ In a SvelteKit project, install everything in one cmd!

(step 0, if it's not done, create a [sveltekit project](https://kit.svelte.dev/) with everything `true` 🙃)

```bash
yarn add @kitql/all-in
```

## 2️⃣ Create a `.graphqlrc.yaml` at the root of your project

```yaml
# Typical File for extension: vscode-graphql & CodeGen!
projects:
  default:
    schema:
      - ./src/lib/modules/**/typedefs/*.graphql
    documents:
      - ./src/lib/modules/**/graphql/*.gql
    extensions:
      endpoints:
        default:
          url: 'http://localhost:3777/api/graphql'
      codegen:
        generates:
          ./src/lib/modules/:
            preset: graphql-modules
            presetConfig:
              baseTypesPath: ../graphql/_kitql/graphqlTypes.ts
              importBaseTypesFrom: $lib/graphql/_kitql/graphqlTypes
              filename: _kitql/moduleTypes.ts
            plugins:
              - typescript
              - typescript-resolvers
              - typescript-operations
              - typed-document-node
            config:
              contextType: $lib/graphql/yogaApp#IYogaContext

          ./src/lib/graphql/_kitql/graphqlStores.ts:
            plugins:
              - '@kitql/graphql-codegen'
            config:
              importBaseTypesFrom: $lib/graphql/_kitql/graphqlTypes

        config:
          useTypeImports: true
```

## 3️⃣ update your `package.json`

- Update your `dev port` to `3777` to fit the previous config file
- Add a `gen` script to launch the codegen

```json
"scripts": {
  "prepare": "yarn gen",                                // will run the codegen after yarn install
  "dev": "svelte-kit dev --port 3178",                  // adapt the port to your needs
  "gen": "graphql-codegen --config ./.graphqlrc.yaml",  // run codegen with the right config file
}
```

## 4️⃣ Install the plugin Watch & Run

In your `svelte.config.js` add a watchAndRun with the following configuration:

```js
import watchAndRun from './vite-plugin-watch-and-run.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		vite: {
			plugins: [
				watchAndRun([
					{
						watch: '**/*.(gql|graphql)',
						run: 'yarn gen'
					}
				])
			]
		}
	}
};

export default config;
```

## 5️⃣ Run

```bash
yarn dev
```

🥳🥳🥳🥳🥳 (ok not yet, you need a bit more steps to create your server, client, etc, I will add it later to the README, even steps orders will change!).
