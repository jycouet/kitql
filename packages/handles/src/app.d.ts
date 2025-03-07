// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			isTeapot?: boolean
		}
		interface Locals {
			testData: string
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {}
