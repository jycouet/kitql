import { kitQLModules } from '@kitql/all-in';
import { resolvers } from './$kitql/resolvers';
import { typeDefs } from './$kitql/typedefs';

export const __initModule = kitQLModules({
	id: 'init-module',
	typeDefs,
	resolvers
});
