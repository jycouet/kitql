import { dev } from '$app/environment';
import { kitqlServer, type IKitQLContext } from '$lib/graphql/kitQLServer';
import { handleGraphiql } from '@kitql/all-in';
import { handleGraphql } from '@kitql/all-in';
import { sequence } from '@sveltejs/kit/hooks';

/**
 * 1/ With all default options
 */
export const handle = sequence(
	// create the graphql endpoint
	handleGraphql<IKitQLContext>(kitqlServer),

	// enable graphiql in dev mode
	handleGraphiql({
		enabled: dev
	})
);

/**
 * 2/ With custom options
 */
// const endpoint = '/graphql'
// const graphiQLPath = '/graphiql'

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
