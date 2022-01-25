# KitQL - all-in

[KitQL](https://github.com/jycouet/kitql#kitql), _A set of tools, helping **you** building efficient apps in a fast way._

<p align="center">
  <img src="../../logo.svg" width="100" />
</p>

# ⚡How to - all-in

## 1️⃣ In a SvelteKit project, install everything in one cmd!

(step 0, if it's not done, create a [sveltekit project](https://kit.svelte.dev/) with everything `true` 🙃)

```bash
yarn add @kitQL/all-in
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
  "dev": "svelte-kit dev --port 3178",
  "gen": "graphql-codegen --config ./.graphqlrc.yaml",
}
```

## 4️⃣ Run the app

```bash
yarn gen
yarn dev
```

🥳🥳🥳🥳🥳 (ok not yet, you need a bit more steps to create your server, client, etc, I will add it later to the README, even steps orders will change!).
