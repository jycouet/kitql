import type { Actions } from './$types.d.ts'

export const actions = {
  sendSomething: async data => {
    console.log(`sendSomething`, data.params, data.url.searchParams.get('extra'))

    return {
      body: {
        message: `Yes, you sent me something (${data.params.siteId}, ${
          data.params.contractId
        }, ${data.url.searchParams.get('extra')})! ✨ Thank you!`,
      },
    }
  },
} satisfies Actions
