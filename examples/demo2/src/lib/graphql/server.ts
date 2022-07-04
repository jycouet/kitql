import { useErrorHandler } from '@envelop/core';
import { useGraphQlJit } from '@envelop/graphql-jit';
import { useGraphQLModules } from '@envelop/graphql-modules';
import { createServer } from '@graphql-yoga/common';
import type { Application } from 'graphql-modules';
import { createApplication } from 'graphql-modules';
import { modules } from './$kitql/_appModules';

const plugins = [
	useGraphQLModules(
		createApplication({
			modules
			// middlewares: {
			// 	'*': {
			// 		'*': [whiteListAuthMiddleware]
			// 	}
			// }
		})
	),
	useGraphQlJit(),
	useErrorHandler((errors, _args) => {
		console.error(`useErrorHandler`, JSON.stringify(errors, null, 2));
	})
];

function getContext({ request }) {
	// console.log(`request`, request);
	return {
		// authHelper: new AuthHelper(request.headers),
		// prisma: prismaInstance
	};
}

export const yogaServer = createServer({
	logging: false,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	context: getContext as any, //Context will be typed in each resolver with IYogaContext (under)
	plugins
});

// reexport the interface context to be able to use it in code gen, and have resolvers fully typed!
// config:
//   contextType: $graphql/kitQLServer#IKitQLContext
export type IKitQLContext = ReturnType<typeof getContext> & Application;
