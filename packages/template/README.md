# KitQL - graphql-codegen

[KitQL](https://github.com/jycouet/kitql#kitql), _A set of tools, helping **you** building efficient apps in a fast way._

<p align="center">
  <img src="../../logo.svg" width="100" />
</p>

# ⚡How to - graphql-codegen

```bash
pnpm add -D @kitql/graphql-codegen
```

Typical CodeGen file (`.graphqlrc.yaml`)

```yaml
# ...
codegen:
  generates:
    ./graphql/$kitql/graphqlTypes.ts:
      plugins:
        - typescript
        - typescript-resolvers
        - typescript-operations
        - typed-document-node

    ./graphql/$kitql/graphqlStores.ts:
      plugins:
        - '@kitql/graphql-codegen'
      config:
        importBaseTypesFrom: $graphql/$kitql/graphqlTypes # if you don't add this, you have to generate all types in the same file.
# ...
```
