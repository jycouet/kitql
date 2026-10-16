import kitql from './packages/eslint-config/.oxfmtrc.json' with { type: 'json' }

export default {
	...kitql,
	ignorePatterns: ['**/ROUTES.ts'],
}
