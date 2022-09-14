import type { _InitModule } from '../_gen/moduleTypes'

export const resolvers: _InitModule.Resolvers = {
  Query: {
    _greetings: async (root, args) => {
      return 'Hello from KitQL!'
    },
  },
}
