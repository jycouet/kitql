/**
 * PostgreSQL build downloaded on first use, from https://github.com/theseus-rs/postgresql-binaries
 * To bump: change the version and the sha256 of each archive (`<asset>.sha256` of the release).
 */
export const PG_VERSION = '18.6.1'

/** node `${process.platform}-${process.arch}` -> theseus target triple & archive sha256 */
export const TARGETS = /** @type {const} */ ({
	'win32-x64': {
		triple: 'x86_64-pc-windows-msvc',
		sha256: '0c0c845626ed77c605d716051c9e8df3368d07fbbd9f61ea39a4c5c0536fde7e',
	},
	'linux-x64': {
		triple: 'x86_64-unknown-linux-gnu',
		sha256: 'e84b02dd8d0ce5879fb697330a789231c8b8f8d958dae3ad4d90fecc710b1315',
	},
	'linux-arm64': {
		triple: 'aarch64-unknown-linux-gnu',
		sha256: '1ab47fa2f06ff70454309ad02e5d89c46488300d43977231481fd6b160b9d556',
	},
	'darwin-arm64': {
		triple: 'aarch64-apple-darwin',
		sha256: '89e91cc80650a43d22c018b95ca356a0c9e15838a1182fed2880bfb5d7d9c9a6',
	},
	'darwin-x64': {
		triple: 'x86_64-apple-darwin',
		sha256: '4229812543e19c91864ebdf5d8f78883c5816d51d4cc5d065298260c1f64d37e',
	},
})

/** @typedef {keyof typeof TARGETS} Target */

/**
 * @param {string} version
 * @param {string} triple
 */
export function archiveUrl(version, triple) {
	return `https://github.com/theseus-rs/postgresql-binaries/releases/download/${version}/postgresql-${version}-${triple}.tar.gz`
}
