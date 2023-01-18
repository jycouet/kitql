import type { __InitModule } from '../$kitql/moduleTypes'

export const resolvers: __InitModule.Resolvers = {
  Mutation: {
    _boostServer: async (root, args, ctx) => {
      return `Done! KitQL is on 🔥`
    },
  },
}
