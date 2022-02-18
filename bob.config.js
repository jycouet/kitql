module.exports = {
	scope: '@kitql', // Scope of organization
	ignore: [], // ignored packages
	track: [
		// files in root that mark the entire workspace as dirty
		'bob.config.js', // we could include it in Bob itself but we decided to turn your life into hell :)
		'package.json',
		'tsconfig.json',
		// files in packages that mark the package as dirty
		'<project>/src/**',
		'<project>/package.json',
		'<project>/tsconfig.json'
	],
	base: 'origin/main', // we need to compare against something
	commands: {
		test: {
			track: ['<project>/tests/**'],
			run(affected) {
				// {
				//   paths: string[] <- ['packages/core', 'packages/cli']
				//   names: string[] <- ['@foo/core', '@foo/cli']
				// }

				// why such a weird syntax? We use spawn, so you have too
				return [`yarn`, ['test', ...affected.paths]];
			}
		},
		build: {
			run() {
				return [`yarn`, ['build']];
			}
		}
	}
};
