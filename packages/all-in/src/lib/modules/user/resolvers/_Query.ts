import { topLevelFields } from '$lib/graphql/helper'
import type { UserConnection } from '$lib/graphql/_kitql/graphqlTypes'
import { _InitModule } from '$lib/modules/_init/_kitql/moduleTypes'
import { UserModule } from '../_kitql/moduleTypes'

export const resolvers: UserModule.Resolvers = {
  Query: {
    user: async (root, args, ctx) => {
      return {}
    },
  },

  QueryUser: {
    get: async (root, args, ctx) => {
      return {
        id: '1',
        username: 'JYC',
      }
    },
    connection: async (root, args, ctx, info) => {
      const fields = topLevelFields(info)
      const toReturn: UserConnection = {
        __typename: 'UserConnection',
        edges: null,
        pageInfo: null,
        totalCount: null,
      }
      if (fields.includes('edges')) {
        toReturn.edges = [
          {
            cursor: '123',
            node: {
              id: '1',
              username: 'JYC',
            },
          },
        ]
      }
      if (fields.includes('pageInfo')) {
        toReturn.pageInfo = {
          hasNextPage: true,
          hasPreviousPage: true,
          startCursor: '123',
          endCursor: '123',
        }
      }
      if (fields.includes('totalCount')) {
        toReturn.totalCount = 1
      }
      return toReturn
    },
  },
}
