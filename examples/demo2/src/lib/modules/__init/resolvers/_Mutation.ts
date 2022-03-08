import { type __InitModule } from '../_kitql/moduleTypes';

export const resolvers: __InitModule.Resolvers = {
	Mutation: {
		_boostServer: async (_root, _args) => {
			return `Done! You're on 🔥`;
		}
	}
};
