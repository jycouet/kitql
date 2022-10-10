import { gql } from 'graphql-modules'

export const typeDefs = gql`
type User {
  id: ID!
  username: String!
}

extend type Mutation {
  userCreate(fields: UserCreateFields!): User
  userUpdate(id: ID!, fields: UserUpdateFields!): User
  userDelete(id: ID!): User
}

input UserCreateFields {
  username: String!
}

input UserUpdateFields {
  username: String
}

extend type Query {
  user(id: ID!): User
  userConnection(cursor: CursorArgs, filter: UserFilter): UserConnection
}

type UserConnection {
  edges: [UserEdge]
  pageInfo: PageInfo
  totalCount: Int
}

type UserEdge {
  cursor: String
  node: User
}

input UserFilter {
  name: String
}

input CursorArgs {
  first: Int
  after: String
  last: Int
  before: String
}

type PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor: String
  endCursor: String
}

`;