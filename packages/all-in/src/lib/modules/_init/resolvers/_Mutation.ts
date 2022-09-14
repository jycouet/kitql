import type { __InitModule } from '../_gen/moduleTypes'

export const resolvers: __InitModule.Resolvers = {
  Mutation: {
    _boostServer: async (_root, _args, _ctx) => {
      return `Done! KitQL is on 🔥`
    },
  },
}
