import { GraphQLYogaError } from '@graphql-yoga/common';
import type { __InitModule } from '../_kitql/moduleTypes';

export const resolvers: __InitModule.Resolvers = {
	Mutation: {
		_boostServer: async (_root, _args, _ctx, _info) => {
			return `Done! You're on 🔥`;
		},
		_generateError: async (_root, _args, _ctx, _info) => {
			throw new GraphQLYogaError(`Error thrown 💥`, {
				code: 'ERROR_007'
			});
		}
	}
};
