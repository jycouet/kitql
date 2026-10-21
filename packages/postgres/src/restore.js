const NEW_LINE = /\r?\n/
// `<id>; <tableoid> <oid> <desc> <namespace> <tag> <owner>`: match the desc, not any "EXTENSION" in a name
const EXTENSION = /^\d+; \d+ \d+ EXTENSION - (\S+)(?: |$)/
const EXTENSION_COMMENT = /^\d+; \d+ \d+ COMMENT - EXTENSION (?:"([^"]+)"|(\S+))(?: |$)/

/**
 * Drop `CREATE EXTENSION` (and its comment) for extensions this server can't create.
 * @param {string} toc output of `pg_restore -l`
 * @param {Iterable<string>} available names from `pg_available_extensions`
 */
export function skipMissingExtensions(toc, available) {
	const ok = new Set(available)
	/** @type {string[]} */
	const skipped = []
	const lines = toc.split(NEW_LINE).filter((line) => {
		const ext = EXTENSION.exec(line)
		if (ext && !ok.has(ext[1])) {
			skipped.push(ext[1])
			return false
		}
		const comment = EXTENSION_COMMENT.exec(line)
		return !(comment && !ok.has(comment[1] ?? comment[2]))
	})
	return { list: lines.join('\n'), skipped }
}
