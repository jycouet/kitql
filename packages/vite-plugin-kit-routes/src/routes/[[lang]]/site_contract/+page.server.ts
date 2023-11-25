export const actions = {
  noSatisfies: async data => {
    console.log(`sendSomething`)

    return {
      body: {
        message: `Yes, you sent me something (${data.params.lang}! ✨ Thank you!`,
      },
    }
  },
}
