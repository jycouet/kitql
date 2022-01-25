import { Types } from "@graphql-codegen/plugin-helpers";
import { parse } from "graphql";
import { plugin } from "../src";

const operations = [
  {
    document: parse(`query me { id }`),
  },
  {
    document: parse(`mutation doSomething { id }`),
  },
  {
    document: parse(`query { id }`),
  },
  {
    document: parse(`fragment Test on Test { t }`),
  },
];

describe("graphql-codegen", () => {
  it("Without importBaseTypesFrom, should not import Types", async () => {
    const result = (await plugin(
      null as any,
      operations,
      {}
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(
      `import type { OperationStore } from '@urql/svelte';`
    );

    expect(result.content).toContain(
      "export type MeQueryStore = OperationStore<MeQuery, MeQueryVariables>;"
    );
    expect(result.content).toContain(
      "export type DoSomethingMutationStore = OperationStore<DoSomethingMutation, DoSomethingMutationVariables>;"
    );
  });

  it("With importBaseTypesFrom, should import Types", async () => {
    const result = (await plugin(null as any, operations, {
      importBaseTypesFrom: "$graphql/_gen/graphqlTypes",
    })) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(
      `import * as Types from "$graphql/_gen/graphqlTypes";`
    );

    expect(result.content).toContain(
      "export type MeQueryStore = OperationStore<Types.MeQuery, Types.MeQueryVariables>;"
    );
  });
});
