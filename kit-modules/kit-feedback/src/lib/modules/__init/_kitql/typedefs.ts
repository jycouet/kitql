import { gql } from 'graphql-modules'

export const typeDefs = gql`
"Get infos about the version"
type Version {
	"When was the last release?"
	releaseCreatedAtUtc: DateTime!
}

"Our loved graphql Mutation root"
type Mutation {
	_boostServer: String
	_generateError: String
}

"Our loved graphql Query root"
type Query {
	version: Version!
}

scalar Date
scalar DateTime

`;