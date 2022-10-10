import { createModule } from 'graphql-modules';
import { resolvers } from './$kitql/resolvers';
import { typeDefs } from './$kitql/typedefs';

export const __initModule = createModule({
	id: 'init-module',
	typeDefs,
	resolvers
});
