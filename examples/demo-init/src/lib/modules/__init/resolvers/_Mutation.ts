import { GraphQLError } from 'graphql';
import type { __InitModule } from '../$kitql/moduleTypes';

export const resolvers: __InitModule.Resolvers = {
	Mutation: {
		_boostServer: async (_root, _args, _ctx, _info) => {
			return `Done! You're on 🔥`;
		},
		_generateError: async (_root, _args, _ctx, _info) => {
			throw new GraphQLError(
				`Error thrown 💥`
				// error extensions
				// {
				// 	extensions: {
				// 		code: 'USER_NOT_FOUND'
				// 	}
				// }
			);
		}
	}
};
