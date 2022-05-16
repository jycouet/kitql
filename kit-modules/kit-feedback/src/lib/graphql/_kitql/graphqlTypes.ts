import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import gql from 'graphql-tag';
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
  Date: any;
  DateTime: any;
};

export type AddReactionFields = {
  content: Reaction;
  subjectID: Scalars['ID'];
};

export type Comment = {
  __typename?: 'Comment';
  author?: Maybe<Scalars['String']>;
  body?: Maybe<Scalars['String']>;
  bodyHTML?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id?: Maybe<Scalars['ID']>;
  isMinimized?: Maybe<Scalars['Boolean']>;
  isPublic?: Maybe<Scalars['Boolean']>;
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
  body?: InputMaybe<Scalars['String']>;
  milestoneId?: InputMaybe<Scalars['ID']>;
  title: Scalars['String'];
};

export type Issue = {
  __typename?: 'Issue';
  author?: Maybe<Scalars['String']>;
  bodyHTML?: Maybe<Scalars['String']>;
  comments?: Maybe<Comments>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id?: Maybe<Scalars['ID']>;
  metadata?: Maybe<Comment>;
  number?: Maybe<Scalars['Int']>;
  titleHTML?: Maybe<Scalars['String']>;
};

export type IssueFilters = {
  labels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  milestoneNumber?: InputMaybe<Scalars['String']>;
  states?: InputMaybe<Array<InputMaybe<IssueState>>>;
};

export enum IssueState {
  Closed = 'CLOSED',
  Open = 'OPEN'
}

export type IssueTemplate = {
  __typename?: 'IssueTemplate';
  body?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

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
  issueTemplate?: Maybe<IssueTemplate>;
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
export type QueryIssueTemplateArgs = {
  name: Scalars['String'];
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

export enum Reaction {
  Confused = 'CONFUSED',
  Eyes = 'EYES',
  Heart = 'HEART',
  Hooray = 'HOORAY',
  Laugh = 'LAUGH',
  Rocket = 'ROCKET',
  ThumbsDown = 'THUMBS_DOWN',
  ThumbsUp = 'THUMBS_UP'
}

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

export type CommentDetailFragment = { __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null };

export type IssueDetailFragment = { __typename?: 'Issue', id?: string | null, author?: string | null, createdAt?: any | null, titleHTML?: string | null, bodyHTML?: string | null, comments?: { __typename?: 'Comments', next?: string | null, nodes?: Array<{ __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null }> | null } | null };

export type IssuePreviewFragment = { __typename?: 'Issue', id?: string | null, number?: number | null, titleHTML?: string | null, metadata?: { __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null } | null };

export type IssueTemplateDetailFragment = { __typename?: 'IssueTemplate', name?: string | null, title?: string | null, body?: string | null };

export type MilestonePreviewFragment = { __typename?: 'Milestone', id: string, number?: number | null, title: string };

export type CreateCommentMutationVariables = Exact<{
  fields: CreateCommentFields;
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment?: { __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null } | null };

export type AddReactionMutationVariables = Exact<{
  fields: AddReactionFields;
}>;


export type AddReactionMutation = { __typename?: 'Mutation', addReaction?: number | null };

export type CreateIssueMutationVariables = Exact<{
  fields: CreateIssueFields;
}>;


export type CreateIssueMutation = { __typename?: 'Mutation', createIssue?: { __typename?: 'Issue', id?: string | null, number?: number | null, titleHTML?: string | null, metadata?: { __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null } | null } | null };

export type MinimizeCommentMutationVariables = Exact<{
  fields: MinimizeCommentFields;
}>;


export type MinimizeCommentMutation = { __typename?: 'Mutation', minimizeComment?: { __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null } | null };

export type UpdateCommentMutationVariables = Exact<{
  fields: UpdateCommentFields;
}>;


export type UpdateCommentMutation = { __typename?: 'Mutation', updateComment?: { __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null } | null };

export type IssueQueryVariables = Exact<{
  number: Scalars['Int'];
}>;


export type IssueQuery = { __typename?: 'Query', issue?: { __typename?: 'Issue', id?: string | null, author?: string | null, createdAt?: any | null, titleHTML?: string | null, bodyHTML?: string | null, comments?: { __typename?: 'Comments', next?: string | null, nodes?: Array<{ __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null }> | null } | null } | null };

export type IssueTemplateQueryVariables = Exact<{
  name: Scalars['String'];
}>;


export type IssueTemplateQuery = { __typename?: 'Query', issueTemplate?: { __typename?: 'IssueTemplate', name?: string | null, title?: string | null, body?: string | null } | null };

export type IssuesQueryVariables = Exact<{
  filters?: InputMaybe<IssueFilters>;
  pagination: Pagination;
}>;


export type IssuesQuery = { __typename?: 'Query', issues?: { __typename?: 'Issues', next?: string | null, nodes?: Array<{ __typename?: 'Issue', id?: string | null, number?: number | null, titleHTML?: string | null, metadata?: { __typename?: 'Comment', id?: string | null, isMinimized?: boolean | null, isPublic?: boolean | null, createdAt?: any | null, author?: string | null, body?: string | null, bodyHTML?: string | null } | null }> | null } | null };

export type MilestonesQueryVariables = Exact<{
  filters: MilestoneFilters;
  pagination: Pagination;
}>;


export type MilestonesQuery = { __typename?: 'Query', milestones?: { __typename?: 'Milestones', next?: string | null, nodes?: Array<{ __typename?: 'Milestone', id: string, number?: number | null, title: string } | null> | null } | null };

export type RepositoryConstantsQueryVariables = Exact<{ [key: string]: never; }>;


export type RepositoryConstantsQuery = { __typename?: 'Query', repositoryConstants: { __typename?: 'RepositoryConstants', repositoryID: string, createIssueLabelID: string } };

export const CommentDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"commentDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Comment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isMinimized"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"bodyHTML"}}]}}]} as unknown as DocumentNode<CommentDetailFragment, unknown>;
export const IssueDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"issueDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"author"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"titleHTML"}},{"kind":"Field","name":{"kind":"Name","value":"bodyHTML"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"next"}},{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<IssueDetailFragment, unknown>;
export const IssuePreviewFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"issuePreview"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Issue"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"titleHTML"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<IssuePreviewFragment, unknown>;
export const IssueTemplateDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"issueTemplateDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"IssueTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]} as unknown as DocumentNode<IssueTemplateDetailFragment, unknown>;
export const MilestonePreviewFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"milestonePreview"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Milestone"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]} as unknown as DocumentNode<MilestonePreviewFragment, unknown>;
export const CreateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCommentFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<CreateCommentMutation, CreateCommentMutationVariables>;
export const AddReactionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddReaction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddReactionFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addReaction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}]}]}}]} as unknown as DocumentNode<AddReactionMutation, AddReactionMutationVariables>;
export const CreateIssueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateIssue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateIssueFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createIssue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"issuePreview"}}]}}]}},...IssuePreviewFragmentDoc.definitions]} as unknown as DocumentNode<CreateIssueMutation, CreateIssueMutationVariables>;
export const MinimizeCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MinimizeComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MinimizeCommentFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minimizeComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<MinimizeCommentMutation, MinimizeCommentMutationVariables>;
export const UpdateCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fields"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCommentFields"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"fields"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fields"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"commentDetail"}}]}}]}},...CommentDetailFragmentDoc.definitions]} as unknown as DocumentNode<UpdateCommentMutation, UpdateCommentMutationVariables>;
export const IssueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Issue"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"number"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issue"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"number"},"value":{"kind":"Variable","name":{"kind":"Name","value":"number"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"issueDetail"}}]}}]}},...IssueDetailFragmentDoc.definitions]} as unknown as DocumentNode<IssueQuery, IssueQueryVariables>;
export const IssueTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IssueTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issueTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"issueTemplateDetail"}}]}}]}},...IssueTemplateDetailFragmentDoc.definitions]} as unknown as DocumentNode<IssueTemplateQuery, IssueTemplateQueryVariables>;
export const IssuesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Issues"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"IssueFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"issuePreview"}}]}},{"kind":"Field","name":{"kind":"Name","value":"next"}}]}}]}},...IssuePreviewFragmentDoc.definitions]} as unknown as DocumentNode<IssuesQuery, IssuesQueryVariables>;
export const MilestonesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Milestones"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MilestoneFilters"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Pagination"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"milestones"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"milestonePreview"}}]}},{"kind":"Field","name":{"kind":"Name","value":"next"}}]}}]}},...MilestonePreviewFragmentDoc.definitions]} as unknown as DocumentNode<MilestonesQuery, MilestonesQueryVariables>;
export const RepositoryConstantsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RepositoryConstants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repositoryConstants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"repositoryID"}},{"kind":"Field","name":{"kind":"Name","value":"createIssueLabelID"}}]}}]}}]} as unknown as DocumentNode<RepositoryConstantsQuery, RepositoryConstantsQueryVariables>;
export const CommentDetail = gql`
    fragment commentDetail on Comment {
  id
  isMinimized
  isPublic
  createdAt
  author
  body
  bodyHTML
}
    `;
export const IssueDetail = gql`
    fragment issueDetail on Issue {
  id
  author
  createdAt
  titleHTML
  bodyHTML
  comments {
    next
    nodes {
      ...commentDetail
    }
  }
}
    ${CommentDetail}`;
export const IssuePreview = gql`
    fragment issuePreview on Issue {
  id
  number
  titleHTML
  metadata {
    ...commentDetail
  }
}
    ${CommentDetail}`;
export const IssueTemplateDetail = gql`
    fragment issueTemplateDetail on IssueTemplate {
  name
  title
  body
}
    `;
export const MilestonePreview = gql`
    fragment milestonePreview on Milestone {
  id
  number
  title
}
    `;
export const CreateComment = gql`
    mutation CreateComment($fields: CreateCommentFields!) {
  createComment(fields: $fields) {
    ...commentDetail
  }
}
    ${CommentDetail}`;
export const AddReaction = gql`
    mutation AddReaction($fields: AddReactionFields!) {
  addReaction(fields: $fields)
}
    `;
export const CreateIssue = gql`
    mutation CreateIssue($fields: CreateIssueFields!) {
  createIssue(fields: $fields) {
    ...issuePreview
  }
}
    ${IssuePreview}`;
export const MinimizeComment = gql`
    mutation MinimizeComment($fields: MinimizeCommentFields!) {
  minimizeComment(fields: $fields) {
    ...commentDetail
  }
}
    ${CommentDetail}`;
export const UpdateComment = gql`
    mutation UpdateComment($fields: UpdateCommentFields!) {
  updateComment(fields: $fields) {
    ...commentDetail
  }
}
    ${CommentDetail}`;
export const Issue = gql`
    query Issue($number: Int!) {
  issue(number: $number) {
    ...issueDetail
  }
}
    ${IssueDetail}`;
export const IssueTemplate = gql`
    query IssueTemplate($name: String!) {
  issueTemplate(name: $name) {
    ...issueTemplateDetail
  }
}
    ${IssueTemplateDetail}`;
export const Issues = gql`
    query Issues($filters: IssueFilters, $pagination: Pagination!) {
  issues(filters: $filters, pagination: $pagination) {
    nodes {
      ...issuePreview
    }
    next
  }
}
    ${IssuePreview}`;
export const Milestones = gql`
    query Milestones($filters: MilestoneFilters!, $pagination: Pagination!) {
  milestones(filters: $filters, pagination: $pagination) {
    nodes {
      ...milestonePreview
    }
    next
  }
}
    ${MilestonePreview}`;
export const RepositoryConstants = gql`
    query RepositoryConstants {
  repositoryConstants {
    repositoryID
    createIssueLabelID
  }
}
    `;