/** Kept parts of a theseus release; everything else is dropped */
const KEEP = [/^bin\//, /^lib\//, /^share\//, /^LICENSE$/, /^COPYRIGHT$/, /^dependency-notices\//]

/** Dropped inside the kept parts: build-time files and the bundled python (only for plpython) */
const DROP = [
	/^bin\/(DLLs|Lib)\//,
	/^bin\/python[^/]*$/,
	/^bin\/(ecpg|test_cloexec|pg_config)(\.exe)?$/,
	/^lib\/(pgxs|pkgconfig|python[^/]*)\//,
	/^lib\/libpython/,
	/^lib\/[^/]*\.(a|lib)$/,
	/plpython/,
	/^share\/(doc|man)\//,
]

/**
 * Should this file of the release (path relative to its top folder) be shipped?
 * @param {string} rel
 */
export function keep(rel) {
	return KEEP.some((r) => r.test(rel)) && !DROP.some((r) => r.test(rel))
}
