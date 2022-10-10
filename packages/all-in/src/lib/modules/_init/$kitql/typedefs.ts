import { gql } from 'graphql-modules'

export const typeDefs = gql`
"Our loved graphql Mutation root"
type Mutation {
  _boostServer: String
}

"Our loved graphql Query root"
type Query {
  _greetings: String
}

`;