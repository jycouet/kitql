import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
	},
	retries: 5,
	timeout: 7000,
	testMatch: /(.+\.)?(e2e)\.[jt]s/,
	use: {
		baseURL: 'http://localhost:4173',
	},
}

export default config
