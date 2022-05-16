import * as Types from "$graphql/_kitql/graphqlTypes";
import * as gm from "graphql-modules";
export namespace KitFeedbackModule {
  interface DefinedFields {
    Comment: 'id' | 'isMinimized' | 'isPublic' | 'createdAt' | 'author' | 'bodyHTML';
    Comments: 'nodes' | 'next';
    Issue: 'id' | 'number' | 'author' | 'createdAt' | 'titleHTML' | 'bodyHTML' | 'metadata' | 'comments';
    Issues: 'nodes' | 'next';
    Milestone: 'id' | 'title' | 'number' | 'description';
    Milestones: 'nodes' | 'next';
    RepositoryConstants: 'repositoryID' | 'createIssueLabelID';
    Mutation: 'createComment' | 'addReaction' | 'createIssue' | 'minimizeComment' | 'updateComment';
    Query: 'repositoryConstants' | 'issue' | 'issues' | 'milestones';
  };
  
  interface DefinedEnumValues {
    IssueState: 'OPEN' | 'CLOSED';
    Reaction: 'CONFUSED' | 'EYES' | 'HEART' | 'HOORAY' | 'LAUGH' | 'ROCKET' | 'THUMBS_DOWN' | 'THUMBS_UP';
  };
  
  interface DefinedInputFields {
    AddReactionFields: 'subjectID' | 'content';
    CreateCommentFields: 'issueID' | 'body';
    UpdateCommentFields: 'commentID' | 'body';
    MinimizeCommentFields: 'commentID';
    CreateIssueFields: 'repositoryID' | 'milestoneId' | 'title' | 'body' | 'labelIDs' | 'assigneeIDs' | 'issueTemplate';
    IssueFilters: 'labels' | 'milestoneId' | 'states';
    MilestoneFilters: 'title';
    Pagination: 'take' | 'cursor';
  };
  
  export type IssueState = DefinedEnumValues['IssueState'];
  export type Reaction = DefinedEnumValues['Reaction'];
  export type AddReactionFields = Pick<Types.AddReactionFields, DefinedInputFields['AddReactionFields']>;
  export type Comment = Pick<Types.Comment, DefinedFields['Comment']>;
  export type DateTime = Types.DateTime;
  export type Comments = Pick<Types.Comments, DefinedFields['Comments']>;
  export type CreateCommentFields = Pick<Types.CreateCommentFields, DefinedInputFields['CreateCommentFields']>;
  export type UpdateCommentFields = Pick<Types.UpdateCommentFields, DefinedInputFields['UpdateCommentFields']>;
  export type MinimizeCommentFields = Pick<Types.MinimizeCommentFields, DefinedInputFields['MinimizeCommentFields']>;
  export type Issue = Pick<Types.Issue, DefinedFields['Issue']>;
  export type Issues = Pick<Types.Issues, DefinedFields['Issues']>;
  export type CreateIssueFields = Pick<Types.CreateIssueFields, DefinedInputFields['CreateIssueFields']>;
  export type IssueFilters = Pick<Types.IssueFilters, DefinedInputFields['IssueFilters']>;
  export type Milestone = Pick<Types.Milestone, DefinedFields['Milestone']>;
  export type Milestones = Pick<Types.Milestones, DefinedFields['Milestones']>;
  export type MilestoneFilters = Pick<Types.MilestoneFilters, DefinedInputFields['MilestoneFilters']>;
  export type Pagination = Pick<Types.Pagination, DefinedInputFields['Pagination']>;
  export type RepositoryConstants = Pick<Types.RepositoryConstants, DefinedFields['RepositoryConstants']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  
  export type CommentResolvers = Pick<Types.CommentResolvers, DefinedFields['Comment'] | '__isTypeOf'>;
  export type CommentsResolvers = Pick<Types.CommentsResolvers, DefinedFields['Comments'] | '__isTypeOf'>;
  export type IssueResolvers = Pick<Types.IssueResolvers, DefinedFields['Issue'] | '__isTypeOf'>;
  export type IssuesResolvers = Pick<Types.IssuesResolvers, DefinedFields['Issues'] | '__isTypeOf'>;
  export type MilestoneResolvers = Pick<Types.MilestoneResolvers, DefinedFields['Milestone'] | '__isTypeOf'>;
  export type MilestonesResolvers = Pick<Types.MilestonesResolvers, DefinedFields['Milestones'] | '__isTypeOf'>;
  export type RepositoryConstantsResolvers = Pick<Types.RepositoryConstantsResolvers, DefinedFields['RepositoryConstants'] | '__isTypeOf'>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  
  export interface Resolvers {
    Comment?: CommentResolvers;
    Comments?: CommentsResolvers;
    Issue?: IssueResolvers;
    Issues?: IssuesResolvers;
    Milestone?: MilestoneResolvers;
    Milestones?: MilestonesResolvers;
    RepositoryConstants?: RepositoryConstantsResolvers;
    Mutation?: MutationResolvers;
    Query?: QueryResolvers;
  };
  
  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Comment?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      isMinimized?: gm.Middleware[];
      isPublic?: gm.Middleware[];
      createdAt?: gm.Middleware[];
      author?: gm.Middleware[];
      bodyHTML?: gm.Middleware[];
    };
    Comments?: {
      '*'?: gm.Middleware[];
      nodes?: gm.Middleware[];
      next?: gm.Middleware[];
    };
    Issue?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      number?: gm.Middleware[];
      author?: gm.Middleware[];
      createdAt?: gm.Middleware[];
      titleHTML?: gm.Middleware[];
      bodyHTML?: gm.Middleware[];
      metadata?: gm.Middleware[];
      comments?: gm.Middleware[];
    };
    Issues?: {
      '*'?: gm.Middleware[];
      nodes?: gm.Middleware[];
      next?: gm.Middleware[];
    };
    Milestone?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      title?: gm.Middleware[];
      number?: gm.Middleware[];
      description?: gm.Middleware[];
    };
    Milestones?: {
      '*'?: gm.Middleware[];
      nodes?: gm.Middleware[];
      next?: gm.Middleware[];
    };
    RepositoryConstants?: {
      '*'?: gm.Middleware[];
      repositoryID?: gm.Middleware[];
      createIssueLabelID?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      createComment?: gm.Middleware[];
      addReaction?: gm.Middleware[];
      createIssue?: gm.Middleware[];
      minimizeComment?: gm.Middleware[];
      updateComment?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      repositoryConstants?: gm.Middleware[];
      issue?: gm.Middleware[];
      issues?: gm.Middleware[];
      milestones?: gm.Middleware[];
    };
  };
}