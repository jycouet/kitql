/**
 * PostgreSQL build shipped in the `@kitql/postgres-<platform>` packages.
 * Keep in sync with the `postgres` catalog in `pnpm-workspace.yaml` (a test checks it).
 * It comes from https://github.com/theseus-rs/postgresql-binaries
 */
export const PG_VERSION = '18.6.1'

/** node `${process.platform}-${process.arch}` -> theseus target triple */
export const TARGETS = /** @type {const} */ ({
	'win32-x64': 'x86_64-pc-windows-msvc',
	'linux-x64': 'x86_64-unknown-linux-gnu',
	'linux-arm64': 'aarch64-unknown-linux-gnu',
	'darwin-arm64': 'aarch64-apple-darwin',
	'darwin-x64': 'x86_64-apple-darwin',
})

/** @param {string} platform e.g. `win32-x64` */
export function platformPackageName(platform) {
	return `@kitql/postgres-${platform}`
}
