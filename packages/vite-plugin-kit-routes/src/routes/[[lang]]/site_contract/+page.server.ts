export const actions = {
  noSatisfies: async data => {
    console.log(`noSatisfies`)

    return {
      body: {
        message: `Yes, you sent me (${data.params.lang}! ✨ Thank you!`,
      },
    }
  },
}
