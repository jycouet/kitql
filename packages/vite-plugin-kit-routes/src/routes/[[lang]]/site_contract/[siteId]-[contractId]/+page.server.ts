import type { Actions } from './$types.d.ts'

export const actions = {
  send: async (data) => {
    console.info(`send`, data.params, data.url.searchParams.get('extra'))

    return {
      body: {
        message: `Yes, you sent (${data.params.siteId}, ${
          data.params.contractId
        }, ${data.url.searchParams.get('extra')})! ✨ Thank you!`,
      },
    }
  },
} satisfies Actions
