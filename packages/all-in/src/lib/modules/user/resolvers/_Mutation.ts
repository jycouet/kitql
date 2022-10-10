import type { UserModule } from '../$kitql/moduleTypes'

export const resolvers: UserModule.Resolvers = {
  Mutation: {
    userCreate: async (root, args, ctx) => {
      return { id: '7', username: args.fields.username }
    },
  },
}
