export const actions = {
	noSatisfies: async (data) => {
		console.info(`noSatisfies`)

		return {
			body: {
				message: `Yes, you sent me (${data.params.lang}! ✨ Thank you!`,
			},
		}
	},
}
