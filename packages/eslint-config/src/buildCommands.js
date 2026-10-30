/**
 * Pure helpers that build the shell commands `kitql-lint` runs.
 * Extracted so they can be unit-tested without spawning processes.
 */

const REGEX_POSIX_DQUOTE_SPECIAL = /["$`\\]/g

// cmd.exe stops at 8191 chars, and .cmd shims add their own long paths to the line.
const MAX_ARGS_WIN32 = 6000
// `sh -c` takes the command as one argument, capped at 128 KiB on Linux.
const MAX_ARGS_POSIX = 100_000

/**
 * @typedef {Object} BuildOptions
 * @property {string[]} tools - selected tools
 * @property {boolean} format - format vs lint
 * @property {string} glob - target glob/files
 * @property {string} [pre] - prefix to prepend to commands ('', 'pnpm ', 'npm exec ')
 * @property {string} [pathPrettierIgnore]
 * @property {string} [pathOxfmtrc]
 * @property {boolean} [allowUnmatched] - a list of explicit files may hold nothing lintable
 */

/**
 * @param {BuildOptions} opts
 */
export function buildOxlintCmd(opts) {
	const { tools, format, glob, pre = '', allowUnmatched } = opts
	return (
		pre +
		`oxlint` +
		`${tools.includes('tsgolint') ? ' --type-aware' : ''}` +
		`${format ? ' --fix' : ''}` +
		`${allowUnmatched ? ' --no-error-on-unmatched-pattern' : ''}` +
		` ${glob}`
	)
}

/**
 * @param {BuildOptions} opts
 */
export function buildEslintCmd(opts) {
	const { format, glob, pre = '' } = opts
	return pre + `eslint --no-warn-ignored` + `${format ? ' --fix' : ''}` + ` ${glob}`
}

/**
 * @param {BuildOptions} opts
 */
export function buildOxfmtCmd(opts) {
	const { format, glob, pre = '', pathPrettierIgnore, pathOxfmtrc } = opts
	return (
		pre +
		`oxfmt` +
		(pathPrettierIgnore ? ` --ignore-path ${pathPrettierIgnore}` : '') +
		(pathOxfmtrc ? ` --config ${pathOxfmtrc}` : '') +
		`${format ? ' --write' : ' --check'}` +
		` --no-error-on-unmatched-pattern` +
		` ${glob}`
	)
}

/**
 * Double quotes: cmd.exe (spawn's shell on Windows) keeps single quotes literally.
 * @param {string[]} files
 * @param {string} [platform]
 */
export function quoteFiles(files, platform = process.platform) {
	return files
		.map((f) =>
			platform === 'win32' ? `"${f}"` : `"${f.replace(REGEX_POSIX_DQUOTE_SPECIAL, '\\$&')}"`,
		)
		.join(' ')
}

/**
 * Quoted file lists, each short enough for one command line.
 * @param {string[]} files
 * @param {string} [platform]
 */
export function chunkFiles(files, platform = process.platform) {
	const max = platform === 'win32' ? MAX_ARGS_WIN32 : MAX_ARGS_POSIX
	/** @type {string[]} */
	const chunks = []
	let current = ''
	for (const file of files) {
		const quoted = quoteFiles([file], platform)
		if (current && current.length + 1 + quoted.length > max) {
			chunks.push(current)
			current = quoted
		} else {
			current = current ? `${current} ${quoted}` : quoted
		}
	}
	if (current) chunks.push(current)
	return chunks
}

/**
 * Refs to try for `-d`, best first. Local main can be stale in a worktree flow, and a linter
 * must not fetch, so origin/main comes first. Full ref: a local branch can be named origin/main.
 * @param {string} [explicit] - `-b` value, used as given
 */
export function baseCandidates(explicit) {
	return [...(explicit ? [explicit] : []), 'refs/remotes/origin/main', 'main', 'HEAD~1']
}
