import { gql } from 'graphql-modules'

export const typeDefs = gql`
enum IssueState {
	OPEN
	CLOSED
}

enum Reaction {
	CONFUSED
	EYES
	HEART
	HOORAY
	LAUGH
	ROCKET
	THUMBS_DOWN
	THUMBS_UP
}

input AddReactionFields {
	subjectID: ID!
	content: Reaction!
}

type Comment {
	id: ID!
	isMinimized: Boolean!
	isPublic: Boolean!
	createdAt: DateTime!
	author: String!
	bodyHTML: String!
}

type Comments {
	nodes: [Comment!]
	next: String
}

input CreateCommentFields {
	issueID: ID!
	body: String!
}

input UpdateCommentFields {
	commentID: ID!
	body: String!
}

input MinimizeCommentFields {
	commentID: ID!
}

type Issue {
	id: ID!
	number: Int
	author: String
	createdAt: DateTime
	titleHTML: String
	bodyHTML: String
	metadata: Comment
	comments: Comments
}

type Issues {
	nodes: [Issue!]
	next: String
}

input CreateIssueFields {
	repositoryID: ID!
	milestoneID: ID
	title: String!
	body: String
	labelIDs: [ID!]
	assigneeIDs: [ID!]
	issueTemplate: String
}

input IssueFilters {
	labels: [String]
	milestoneID: ID
	states: [IssueState]
}

type Milestone {
	id: ID!
	title: String!
	number: Int
	description: String
}

type Milestones {
	nodes: [Milestone]
	next: String
}

input MilestoneFilters {
	title: String
}

input Pagination {
	take: Int!
	cursor: String
}

type RepositoryConstants {
	repositoryID: ID!
	createIssueLabelID: ID!
}

extend type Mutation {
	createComment(fields: CreateCommentFields!): Comment
	addReaction(fields: AddReactionFields!): Int
	createIssue(fields: CreateIssueFields!): Issue
	minimizeComment(fields: MinimizeCommentFields!): Comment
	updateComment(fields: UpdateCommentFields!): Comment
}

extend type Query {
	repositoryConstants: RepositoryConstants!
	issue(number: Int!): Issue
	issues(filters: IssueFilters, pagination: Pagination!): Issues
	milestones(filters: MilestoneFilters, pagination: Pagination!): Milestones
}

`;