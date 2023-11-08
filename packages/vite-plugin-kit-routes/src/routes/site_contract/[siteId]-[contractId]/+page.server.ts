import type { Actions } from './$types.d.ts'

export const actions = {
  sendSomething: async data => {
    return {
      body: {
        message: `Yes, you sent me something (${data.params.siteId}, ${data.params.contractId})! ✨ Thank you!`,
      },
    }
  },
} satisfies Actions
