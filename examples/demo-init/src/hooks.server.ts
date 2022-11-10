import { dev } from '$app/environment';
import { kitqlServer, type IKitQLContext } from '$lib/graphql/kitqlServer';
import { handleGraphiql, handleGraphql } from '@kitql/all-in';
import type { RequestEvent } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * 1/ With all default options
 */
export const handle = sequence(
	// create the graphql endpoint
	handleGraphql<IKitQLContext, RequestEvent>(kitqlServer),

	// enable graphiql in dev mode
	handleGraphiql({
		enabled: dev
	})
);

/**
 * 2/ With custom options
 */
// const endpoint = '/api/graphql'
// const graphiQLPath = '/api/graphiql'

// export const handle = sequence(
//   // create the graphql endpoint
//   handleGraphql<IKitQLContext>({
//     endpoint,
//     graphiQLPath,
//     ...kitqlServer,
//   }),

//   // enable graphiql in dev mode
//   handleGraphiql({
//     enabled: dev,
//     endpoint,
//     graphiQLPath,
//   })
// )
