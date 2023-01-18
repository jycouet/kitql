import type { __InitModule } from '../$kitql/moduleTypes'

export const resolvers: __InitModule.Resolvers = {
  Query: {
    _greetings: async (root, args, ctx) => {
      return 'Hello from KitQL!'
    },
  },
}
