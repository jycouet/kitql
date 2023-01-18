// example from https://the-guild.dev/graphql/yoga-server/docs/features/subscriptions
import type { __InitModule } from '../$kitql/moduleTypes';

export const resolvers: __InitModule.Resolvers = {
	Subscription: {
		countdown: {
			// This will return the value on every 1 sec until it reaches 0
			subscribe: async function* (_, { from }) {
				for (let i = from; i >= 0; i--) {
					await new Promise((resolve) => setTimeout(resolve, 1000));
					yield { countdown: i };
				}
			}
		}
	}
};
