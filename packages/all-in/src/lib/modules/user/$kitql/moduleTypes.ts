import * as Types from "$graphql/$kitql/graphqlTypes";
import * as gm from "graphql-modules";
export namespace UserModule {
  interface DefinedFields {
    User: 'id' | 'username';
    Mutation: 'userCreate' | 'userUpdate' | 'userDelete';
    Query: 'user' | 'userConnection';
    UserConnection: 'edges' | 'pageInfo' | 'totalCount';
    UserEdge: 'cursor' | 'node';
    PageInfo: 'hasNextPage' | 'hasPreviousPage' | 'startCursor' | 'endCursor';
  };
  
  interface DefinedInputFields {
    UserCreateFields: 'username';
    UserUpdateFields: 'username';
    UserFilter: 'name';
    CursorArgs: 'first' | 'after' | 'last' | 'before';
  };
  
  export type User = Pick<Types.User, DefinedFields['User']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type UserCreateFields = Pick<Types.UserCreateFields, DefinedInputFields['UserCreateFields']>;
  export type UserUpdateFields = Pick<Types.UserUpdateFields, DefinedInputFields['UserUpdateFields']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type UserConnection = Pick<Types.UserConnection, DefinedFields['UserConnection']>;
  export type CursorArgs = Pick<Types.CursorArgs, DefinedInputFields['CursorArgs']>;
  export type UserFilter = Pick<Types.UserFilter, DefinedInputFields['UserFilter']>;
  export type UserEdge = Pick<Types.UserEdge, DefinedFields['UserEdge']>;
  export type PageInfo = Pick<Types.PageInfo, DefinedFields['PageInfo']>;
  
  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type UserConnectionResolvers = Pick<Types.UserConnectionResolvers, DefinedFields['UserConnection'] | '__isTypeOf'>;
  export type UserEdgeResolvers = Pick<Types.UserEdgeResolvers, DefinedFields['UserEdge'] | '__isTypeOf'>;
  export type PageInfoResolvers = Pick<Types.PageInfoResolvers, DefinedFields['PageInfo'] | '__isTypeOf'>;
  
  export interface Resolvers {
    User?: UserResolvers;
    Mutation?: MutationResolvers;
    Query?: QueryResolvers;
    UserConnection?: UserConnectionResolvers;
    UserEdge?: UserEdgeResolvers;
    PageInfo?: PageInfoResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    User?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      username?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      userCreate?: gm.Middleware[];
      userUpdate?: gm.Middleware[];
      userDelete?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      user?: gm.Middleware[];
      userConnection?: gm.Middleware[];
    };
    UserConnection?: {
      '*'?: gm.Middleware[];
      edges?: gm.Middleware[];
      pageInfo?: gm.Middleware[];
      totalCount?: gm.Middleware[];
    };
    UserEdge?: {
      '*'?: gm.Middleware[];
      cursor?: gm.Middleware[];
      node?: gm.Middleware[];
    };
    PageInfo?: {
      '*'?: gm.Middleware[];
      hasNextPage?: gm.Middleware[];
      hasPreviousPage?: gm.Middleware[];
      startCursor?: gm.Middleware[];
      endCursor?: gm.Middleware[];
    };
  };
}