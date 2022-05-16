import type { CodegenDate } from '../helpers/scalarTypes';
import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { IKitQLContext } from '$graphql/kitQLServer';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: CodegenDate;
  DateTime: Date;
};

export type AddReactionFields = {
  content: Reaction;
  subjectID: Scalars['ID'];
};

export type Comment = {
  __typename?: 'Comment';
  author: Scalars['String'];
  bodyHTML: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  isMinimized: Scalars['Boolean'];
  isPublic: Scalars['Boolean'];
};

export type Comments = {
  __typename?: 'Comments';
  next?: Maybe<Scalars['String']>;
  nodes?: Maybe<Array<Comment>>;
};

export type CreateCommentFields = {
  body: Scalars['String'];
  issueID: Scalars['ID'];
};

export type CreateIssueFields = {
  assigneeIDs?: InputMaybe<Array<Scalars['ID']>>;
  body?: InputMaybe<Scalars['String']>;
  issueTemplate?: InputMaybe<Scalars['String']>;
  labelIDs?: InputMaybe<Array<Scalars['ID']>>;
  milestoneId?: InputMaybe<Scalars['ID']>;
  repositoryID: Scalars['ID'];
  title: Scalars['String'];
};

export type Issue = {
  __typename?: 'Issue';
  author?: Maybe<Scalars['String']>;
  bodyHTML?: Maybe<Scalars['String']>;
  comments?: Maybe<Comments>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  metadata?: Maybe<Comment>;
  number?: Maybe<Scalars['Int']>;
  titleHTML?: Maybe<Scalars['String']>;
};

export type IssueFilters = {
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  milestoneId?: InputMaybe<Scalars['ID']>;
  states?: InputMaybe<Array<InputMaybe<IssueState>>>;
};

export type IssueState =
  | 'CLOSED'
  | 'OPEN';

export type Issues = {
  __typename?: 'Issues';
  next?: Maybe<Scalars['String']>;
  nodes?: Maybe<Array<Issue>>;
};

export type Milestone = {
  __typename?: 'Milestone';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  number?: Maybe<Scalars['Int']>;
  title: Scalars['String'];
};

export type MilestoneFilters = {
  title?: InputMaybe<Scalars['String']>;
};

export type Milestones = {
  __typename?: 'Milestones';
  next?: Maybe<Scalars['String']>;
  nodes?: Maybe<Array<Maybe<Milestone>>>;
};

export type MinimizeCommentFields = {
  commentID: Scalars['ID'];
};

/** Our loved graphql Mutation root */
export type Mutation = {
  __typename?: 'Mutation';
  _boostServer?: Maybe<Scalars['String']>;
  _generateError?: Maybe<Scalars['String']>;
  addReaction?: Maybe<Scalars['Int']>;
  createComment?: Maybe<Comment>;
  createIssue?: Maybe<Issue>;
  minimizeComment?: Maybe<Comment>;
  updateComment?: Maybe<Comment>;
};


/** Our loved graphql Mutation root */
export type MutationAddReactionArgs = {
  fields: AddReactionFields;
};


/** Our loved graphql Mutation root */
export type MutationCreateCommentArgs = {
  fields: CreateCommentFields;
};


/** Our loved graphql Mutation root */
export type MutationCreateIssueArgs = {
  fields: CreateIssueFields;
};


/** Our loved graphql Mutation root */
export type MutationMinimizeCommentArgs = {
  fields: MinimizeCommentFields;
};


/** Our loved graphql Mutation root */
export type MutationUpdateCommentArgs = {
  fields: UpdateCommentFields;
};

export type Pagination = {
  cursor?: InputMaybe<Scalars['String']>;
  take: Scalars['Int'];
};

/** Our loved graphql Query root */
export type Query = {
  __typename?: 'Query';
  issue?: Maybe<Issue>;
  issues?: Maybe<Issues>;
  milestones?: Maybe<Milestones>;
  repositoryConstants: RepositoryConstants;
  version: Version;
};


/** Our loved graphql Query root */
export type QueryIssueArgs = {
  number: Scalars['Int'];
};


/** Our loved graphql Query root */
export type QueryIssuesArgs = {
  filters?: InputMaybe<IssueFilters>;
  pagination: Pagination;
};


/** Our loved graphql Query root */
export type QueryMilestonesArgs = {
  filters?: InputMaybe<MilestoneFilters>;
  pagination: Pagination;
};

export type Reaction =
  | 'CONFUSED'
  | 'EYES'
  | 'HEART'
  | 'HOORAY'
  | 'LAUGH'
  | 'ROCKET'
  | 'THUMBS_DOWN'
  | 'THUMBS_UP';

export type RepositoryConstants = {
  __typename?: 'RepositoryConstants';
  createIssueLabelID: Scalars['ID'];
  repositoryID: Scalars['ID'];
};

export type UpdateCommentFields = {
  body: Scalars['String'];
  commentID: Scalars['ID'];
};

/** Get infos about the version */
export type Version = {
  __typename?: 'Version';
  /** When was the last release? */
  releaseCreatedAtUtc: Scalars['DateTime'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddReactionFields: AddReactionFields;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Comment: ResolverTypeWrapper<Comment>;
  Comments: ResolverTypeWrapper<Comments>;
  CreateCommentFields: CreateCommentFields;
  CreateIssueFields: CreateIssueFields;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Issue: ResolverTypeWrapper<Issue>;
  IssueFilters: IssueFilters;
  IssueState: IssueState;
  Issues: ResolverTypeWrapper<Issues>;
  Milestone: ResolverTypeWrapper<Milestone>;
  MilestoneFilters: MilestoneFilters;
  Milestones: ResolverTypeWrapper<Milestones>;
  MinimizeCommentFields: MinimizeCommentFields;
  Mutation: ResolverTypeWrapper<{}>;
  Pagination: Pagination;
  Query: ResolverTypeWrapper<{}>;
  Reaction: Reaction;
  RepositoryConstants: ResolverTypeWrapper<RepositoryConstants>;
  String: ResolverTypeWrapper<Scalars['String']>;
  UpdateCommentFields: UpdateCommentFields;
  Version: ResolverTypeWrapper<Version>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddReactionFields: AddReactionFields;
  Boolean: Scalars['Boolean'];
  Comment: Comment;
  Comments: Comments;
  CreateCommentFields: CreateCommentFields;
  CreateIssueFields: CreateIssueFields;
  Date: Scalars['Date'];
  DateTime: Scalars['DateTime'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Issue: Issue;
  IssueFilters: IssueFilters;
  Issues: Issues;
  Milestone: Milestone;
  MilestoneFilters: MilestoneFilters;
  Milestones: Milestones;
  MinimizeCommentFields: MinimizeCommentFields;
  Mutation: {};
  Pagination: Pagination;
  Query: {};
  RepositoryConstants: RepositoryConstants;
  String: Scalars['String'];
  UpdateCommentFields: UpdateCommentFields;
  Version: Version;
};

export type CommentResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  author?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bodyHTML?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isMinimized?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPublic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentsResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Comments'] = ResolversParentTypes['Comments']> = {
  next?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<ResolversTypes['Comment']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type IssueResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Issue'] = ResolversParentTypes['Issue']> = {
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bodyHTML?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comments?: Resolver<Maybe<ResolversTypes['Comments']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  titleHTML?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IssuesResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Issues'] = ResolversParentTypes['Issues']> = {
  next?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<ResolversTypes['Issue']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MilestoneResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Milestone'] = ResolversParentTypes['Milestone']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MilestonesResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Milestones'] = ResolversParentTypes['Milestones']> = {
  next?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nodes?: Resolver<Maybe<Array<Maybe<ResolversTypes['Milestone']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  _boostServer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  _generateError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addReaction?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationAddReactionArgs, 'fields'>>;
  createComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationCreateCommentArgs, 'fields'>>;
  createIssue?: Resolver<Maybe<ResolversTypes['Issue']>, ParentType, ContextType, RequireFields<MutationCreateIssueArgs, 'fields'>>;
  minimizeComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationMinimizeCommentArgs, 'fields'>>;
  updateComment?: Resolver<Maybe<ResolversTypes['Comment']>, ParentType, ContextType, RequireFields<MutationUpdateCommentArgs, 'fields'>>;
};

export type QueryResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  issue?: Resolver<Maybe<ResolversTypes['Issue']>, ParentType, ContextType, RequireFields<QueryIssueArgs, 'number'>>;
  issues?: Resolver<Maybe<ResolversTypes['Issues']>, ParentType, ContextType, RequireFields<QueryIssuesArgs, 'pagination'>>;
  milestones?: Resolver<Maybe<ResolversTypes['Milestones']>, ParentType, ContextType, RequireFields<QueryMilestonesArgs, 'pagination'>>;
  repositoryConstants?: Resolver<ResolversTypes['RepositoryConstants'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Version'], ParentType, ContextType>;
};

export type RepositoryConstantsResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['RepositoryConstants'] = ResolversParentTypes['RepositoryConstants']> = {
  createIssueLabelID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  repositoryID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VersionResolvers<ContextType = IKitQLContext, ParentType extends ResolversParentTypes['Version'] = ResolversParentTypes['Version']> = {
  releaseCreatedAtUtc?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = IKitQLContext> = {
  Comment?: CommentResolvers<ContextType>;
  Comments?: CommentsResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  Issue?: IssueResolvers<ContextType>;
  Issues?: IssuesResolvers<ContextType>;
  Milestone?: MilestoneResolvers<ContextType>;
  Milestones?: MilestonesResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RepositoryConstants?: RepositoryConstantsResolvers<ContextType>;
  Version?: VersionResolvers<ContextType>;
};


export type CommentDetailFragment = { __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string };

export type IssueDetailFragment = { __typename?: 'Issue', id: string, author?: string | null, createdAt?: Date | null, titleHTML?: string | null, bodyHTML?: string | null, comments?: { __typename?: 'Comments', next?: string | null, nodes?: Array<{ __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string }> | null } | null };

export type IssuePreviewFragment = { __typename?: 'Issue', id: string, number?: number | null, titleHTML?: string | null, metadata?: { __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string } | null };

export type MilestonePreviewFragment = { __typename?: 'Milestone', id: string, number?: number | null, title: string };

export type CreateCommentMutationVariables = Exact<{
  fields: CreateCommentFields;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment?: { __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string } | null };

export type AddReactionMutationVariables = Exact<{
  fields: AddReactionFields;
}>;


export type AddReactionMutation = { __typename?: 'Mutation', addReaction?: number | null };

export type CreateIssueMutationVariables = Exact<{
  fields: CreateIssueFields;
}>;


export type CreateIssueMutation = { __typename?: 'Mutation', createIssue?: { __typename?: 'Issue', id: string, number?: number | null, titleHTML?: string | null, metadata?: { __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string } | null } | null };

export type MinimizeCommentMutationVariables = Exact<{
  fields: MinimizeCommentFields;
}>;


export type MinimizeCommentMutation = { __typename?: 'Mutation', minimizeComment?: { __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string } | null };

export type UpdateCommentMutationVariables = Exact<{
  fields: UpdateCommentFields;
}>;


export type UpdateCommentMutation = { __typename?: 'Mutation', updateComment?: { __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string } | null };

export type IssueQueryVariables = Exact<{
  number: Scalars['Int'];
}>;


export type IssueQuery = { __typename?: 'Query', issue?: { __typename?: 'Issue', id: string, author?: string | null, createdAt?: Date | null, titleHTML?: string | null, bodyHTML?: string | null, comments?: { __typename?: 'Comments', next?: string | null, nodes?: Array<{ __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string }> | null } | null } | null };

export type IssuesQueryVariables = Exact<{
  filters?: InputMaybe<IssueFilters>;
  pagination: Pagination;
}>;


export type IssuesQuery = { __typename?: 'Query', issues?: { __typename?: 'Issues', next?: string | null, nodes?: Array<{ __typename?: 'Issue', id: string, number?: number | null, titleHTML?: string | null, metadata?: { __typename?: 'Comment', id: string, isMinimized: boolean, isPublic: boolean, createdAt: Date, author: string, bodyHTML: string } | null }> | null } | null };

export type MilestonesQueryVariables = Exact<{
  filters: MilestoneFilters;
  pagination: Pagination;
}>;


export type MilestonesQuery = { __typename?: 'Query', milestones?: { __typename?: 'Milestones', next?: string | null, nodes?: Array<{ __typename?: 'Milestone', id: string, number?: number | null, title: string } | null> | null } | null };

export type RepositoryConstantsQueryVariables = Exact<{ [key: string]: never; }>;


export type RepositoryConstantsQuery = { __typename?: 'Query', repositoryConstants: { __typename?: 'RepositoryConstants', repositoryID: string, createIssueLabelID: string } };

export const CommentDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commentDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Comment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isMinimized"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"bodyHTML"}}]}}]} as unknown as DocumentNode<CommentDetailFragment, unknown>;
export const IssueDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"issueDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"titleHTML"}},{"kind":"Field","name":{"kind":"Name","value":"bodyHTML"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"next"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<IssueDetailFragment, unknown>;
export const IssuePreviewFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"issuePreview"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"titleHTML"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<IssuePreviewFragment, unknown>;
export const MilestonePreviewFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"milestonePreview"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Milestone"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]} as unknown as DocumentNode<MilestonePreviewFragment, unknown>;
export const CreateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCommentFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<CreateCommentMutation, CreateCommentMutationVariables>;
export const AddReactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddReaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddReactionFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addReaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}]}]}}]} as unknown as DocumentNode<AddReactionMutation, AddReactionMutationVariables>;
export const CreateIssueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateIssue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateIssueFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createIssue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"issuePreview"}}]}}]}},...IssuePreviewFragmentDoc.definitions]} as unknown as DocumentNode<CreateIssueMutation, CreateIssueMutationVariables>;
export const MinimizeCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MinimizeComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MinimizeCommentFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minimizeComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<MinimizeCommentMutation, MinimizeCommentMutationVariables>;
export const UpdateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCommentFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const IssueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Issue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"number"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"number"},"value":{"kind":"Variable","name":{"kind":"Name","value":"number"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"issueDetail"}}]}}]}},...IssueDetailFragmentDoc.definitions]} as unknown as DocumentNode<IssueQuery, IssueQueryVariables>;
export const IssuesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Issues"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"IssueFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"issuePreview"}}]}},{"kind":"Field","name":{"kind":"Name","value":"next"}}]}}]}},...IssuePreviewFragmentDoc.definitions]} as unknown as DocumentNode<IssuesQuery, IssuesQueryVariables>;
export const MilestonesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Milestones"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MilestoneFilters"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"milestones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"milestonePreview"}}]}},{"kind":"Field","name":{"kind":"Name","value":"next"}}]}}]}},...MilestonePreviewFragmentDoc.definitions]} as unknown as DocumentNode<MilestonesQuery, MilestonesQueryVariables>;
export const RepositoryConstantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RepositoryConstants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repositoryConstants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repositoryID"}},{"kind":"Field","name":{"kind":"Name","value":"createIssueLabelID"}}]}}]}}]} as unknown as DocumentNode<RepositoryConstantsQuery, RepositoryConstantsQueryVariables>;
export type Date = Scalars["Date"];
export type DateTime = Scalars["DateTime"];