/**
 * Pure helpers that build the shell commands `kitql-lint` runs.
 * Extracted so they can be unit-tested without spawning processes.
 */

/**
 * @typedef {Object} BuildOptions
 * @property {string[]} tools - selected tools
 * @property {boolean} format - format vs lint
 * @property {string} glob - target glob/files
 * @property {string} [pre] - prefix to prepend to commands ('', 'pnpm ', 'npm exec ')
 * @property {string} [pathPrettierIgnore]
 * @property {string} [pathPrettier_js]
 * @property {string} [pathOxfmtrc]
 */

/**
 * @param {BuildOptions} opts
 */
export function buildOxlintCmd(opts) {
	const { tools, format, glob, pre = '' } = opts
	return (
		pre +
		`oxlint` +
		`${tools.includes('tsgolint') ? ' --type-aware' : ''}` +
		`${format ? ' --fix' : ''}` +
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
export function buildPrettierCmd(opts) {
	const { tools, format, glob, pre = '', pathPrettierIgnore, pathPrettier_js } = opts
	// When oxfmt is in the tool set, oxfmt formats every file type it supports
	// and prettier only handles .svelte (oxfmt can't parse it yet) - regardless of mode.
	const svelteOnly = tools.includes('oxfmt')
	const target = svelteOnly ? `'**/*.svelte'` : glob

	return (
		pre +
		`prettier` +
		` --list-different` +
		` --ignore-path ${pathPrettierIgnore}` +
		` --config ${pathPrettier_js}` +
		`${svelteOnly ? ' --no-error-on-unmatched-pattern' : ''}` +
		`${format ? ' --write' : ''}` +
		` ${target}`
	)
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
