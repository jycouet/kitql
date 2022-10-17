import type * as Types from "$graphql/$kitql/graphqlTypes";
import type * as gm from "graphql-modules";
export namespace _InitModule {
  interface DefinedFields {
    Mutation: '_boostServer';
    Query: '_greetings';
  };
  
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Mutation?: MutationResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      _boostServer?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      _greetings?: gm.Middleware[];
    };
  };
}