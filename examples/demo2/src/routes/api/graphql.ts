import { kitQLServer } from '$graphql/kitQLServer';

export async function get() {
	return {
		status: 302,
		headers: { Location: '/' }
	};
}

export { kitQLServer as post };
