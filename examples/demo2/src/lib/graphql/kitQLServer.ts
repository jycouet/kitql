import type { RequestEvent } from '@sveltejs/kit';
import { kitQLModules } from '@kitql/all-in';
import { modules } from './_kitql/_appModules';

const plugins = [];
plugins.push(kitQLModules(modules));

function getContext({ request }: RequestEvent) {
	// get the cookie or the token...
	const coolInfo = request.headers.get('Authorization');

	// get the user from the coolInfo (redis or db)
	const user = { id: 1, name: 'John' };

	return {
		request,
		user
	};
}

// Option 1 => explicitly set the context type
// export type IKitQLContext = {
//   request: Request
//   user?: {
//     id: number
//     name: string
//   }
// }
// Option 2 => build IKitQLContext from getContext return
export type IKitQLContext = ReturnType<typeof getContext>;

// then, make use of "IKitQLContext" in code gen, generate resolvers fully typed!
// config:
//   contextType: $graphql/kitQLServer#IKitQLContext

export const kitqlServer = {
	plugins,
	getContext
};
