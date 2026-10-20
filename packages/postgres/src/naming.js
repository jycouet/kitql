import { createHash } from 'node:crypto'

/** Postgres truncates identifiers longer than this (in bytes) */
export const MAX_IDENTIFIER_LENGTH = 63
const STARTS_WITH_DIGIT = /^[0-9]/

/**
 * Turn anything (folder name, branch, ...) into a safe lowercase identifier part.
 * `Feat/My-Branch` -> `feat_my_branch`
 * @param {string} name
 */
export function sanitize(name) {
	return name
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9_]+/g, '_')
		.replace(/_+/g, '_')
		.replace(/^_|_$/g, '')
}

/**
 * Database name of a worktree: `<repo>_<worktree>`, sanitized.
 * Always a valid unquoted identifier, max 63 chars (long names keep a hash suffix to stay unique).
 * @param {string} repo
 * @param {string} worktree
 */
export function dbName(repo, worktree) {
	let name = `${sanitize(repo) || 'repo'}_${sanitize(worktree) || 'main'}`
	if (STARTS_WITH_DIGIT.test(name)) {
		name = `db_${name}`
	}
	if (name.length > MAX_IDENTIFIER_LENGTH) {
		const hash = createHash('sha1').update(name).digest('hex').slice(0, 8)
		name = `${name.slice(0, MAX_IDENTIFIER_LENGTH - hash.length - 1)}_${hash}`
	}
	return name
}

/**
 * Quote an identifier for SQL: `my"db` -> `"my""db"`
 * @param {string} name
 */
export function quoteIdent(name) {
	return `"${name.replace(/"/g, '""')}"`
}

/**
 * Quote a literal for SQL: `it's` -> `'it''s'`
 * @param {string} value
 */
export function quoteLiteral(value) {
	return `'${value.replace(/'/g, "''")}'`
}

/** Databases that commands must never drop / overwrite */
export const PROTECTED_DBS = ['postgres', 'template0', 'template1']
