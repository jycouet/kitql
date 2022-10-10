import { sveltekit } from '@sveltejs/kit/vite';
import houdini from 'houdini/vite';
// import watchAndRun from '@kitql/vite-plugin-watch-and-run';

import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [
		houdini(),
		sveltekit()
		// watchAndRun([
		// 	{
		// 		watch: '**/*.(gql|graphql)',
		// 		run: 'npm run gen'
		// 	}
		// ])
	]
};

export default config;
