import type { _InitModule } from '../$kitql/moduleTypes'

export const resolvers: _InitModule.Resolvers = {
  Mutation: {
    _boostServer: async (root, args, ctx) => {
      return `Done! KitQL is on 🔥`
    },
  },
}
