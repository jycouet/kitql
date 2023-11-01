import type { Actions } from './$types.d.ts'

export const actions = {
  sendSomething: async () => {
    return {
      body: {
        message: 'Yes, you sent me something! ✨ Thank you!',
      },
    }
  },
} satisfies Actions
