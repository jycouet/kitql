export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CursorArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Our loved graphql Mutation root */
export type Mutation = {
  __typename?: 'Mutation';
  _boostServer?: Maybe<Scalars['String']>;
  userCreate?: Maybe<User>;
  userDelete?: Maybe<User>;
  userUpdate?: Maybe<User>;
};


/** Our loved graphql Mutation root */
export type MutationUserCreateArgs = {
  fields: UserCreateFields;
};


/** Our loved graphql Mutation root */
export type MutationUserDeleteArgs = {
  id: Scalars['ID'];
};


/** Our loved graphql Mutation root */
export type MutationUserUpdateArgs = {
  fields: UserUpdateFields;
  id: Scalars['ID'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']>;
  startCursor?: Maybe<Scalars['String']>;
};

/** Our loved graphql Query root */
export type Query = {
  __typename?: 'Query';
  _greetings?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  userConnection?: Maybe<UserConnection>;
};


/** Our loved graphql Query root */
export type QueryUserArgs = {
  id: Scalars['ID'];
};


/** Our loved graphql Query root */
export type QueryUserConnectionArgs = {
  cursor?: InputMaybe<CursorArgs>;
  filter?: InputMaybe<UserFilter>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  username: Scalars['String'];
};

export type UserConnection = {
  __typename?: 'UserConnection';
  edges?: Maybe<Array<Maybe<UserEdge>>>;
  pageInfo?: Maybe<PageInfo>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type UserCreateFields = {
  username: Scalars['String'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor?: Maybe<Scalars['String']>;
  node?: Maybe<User>;
};

export type UserFilter = {
  name?: InputMaybe<Scalars['String']>;
};

export type UserUpdateFields = {
  username?: InputMaybe<Scalars['String']>;
};
