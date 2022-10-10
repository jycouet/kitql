import type { _InitModule } from '../$kitql/moduleTypes'

export const resolvers: _InitModule.Resolvers = {
  Query: {
    _greetings: async (root, args, ctx) => {
      return 'Hello from KitQL!'
    },
  },
}
