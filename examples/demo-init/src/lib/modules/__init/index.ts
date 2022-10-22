import { kitqlModules } from '@kitql/all-in';
import { resolvers } from './$kitql/resolvers';
import { typeDefs } from './$kitql/typedefs';

export const __initModule = kitqlModules({
	id: 'init-module',
	typeDefs,
	resolvers
});
