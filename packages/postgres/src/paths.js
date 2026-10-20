import { spawnSync } from 'node:child_process'
import path from 'node:path'

import { dbName } from './naming.js'

const TRAILING_SEPARATORS = /[\\/]+$/
const GIT_SUFFIX = /\.git$/
const NEW_LINE = /\r?\n/

/**
 * @typedef {object} GitInfo
 * @property {string} commonDir `git rev-parse --git-common-dir` (absolute), shared by all worktrees
 * @property {string} gitDir `git rev-parse --git-dir` (absolute), per worktree
 */

/**
 * @typedef {object} Context
 * @property {string} repo repo name (folder of the main worktree)
 * @property {string} worktree worktree name (`main` for the main worktree)
 * @property {string} db database of the current worktree
 * @property {string} home folder holding everything of the repo server
 * @property {string} dataDir postgres data directory (PGDATA)
 * @property {string} logFile server log
 * @property {string} stateFile kitql-postgres settings (port, ...)
 */

/** @param {string} p */
function same(p) {
	const resolved = path.resolve(p).replace(TRAILING_SEPARATORS, '')
	return process.platform === 'win32' ? resolved.toLowerCase() : resolved
}

/**
 * Repo & worktree names out of git dirs.
 * - main worktree: `<repo>/.git` -> repo `<repo>`, worktree `main`
 * - linked worktree: git dir `<repo>/.git/worktrees/<name>` -> worktree `<name>` (git keeps it unique)
 * - bare repo: `<repo>.git` -> repo `<repo>`
 * @param {GitInfo} git
 */
export function parseGitInfo(git) {
	const commonBase = path.basename(git.commonDir)
	const repo =
		commonBase === '.git'
			? path.basename(path.dirname(git.commonDir))
			: commonBase.replace(GIT_SUFFIX, '')
	const worktree = same(git.gitDir) === same(git.commonDir) ? 'main' : path.basename(git.gitDir)
	return { repo, worktree }
}

/**
 * Everything is stored inside the git common dir (`<main worktree>/.git/kitql-postgres`):
 * shared by all worktrees, invisible to `git status`, and it survives `git clean -xdf`.
 * `KITQL_PG_HOME` overrides the location.
 * @param {GitInfo} git
 * @param {Record<string, string | undefined>} [env]
 * @returns {Context}
 */
export function buildContext(git, env = {}) {
	const { repo, worktree } = parseGitInfo(git)
	const home = env.KITQL_PG_HOME
		? path.resolve(env.KITQL_PG_HOME)
		: path.join(git.commonDir, 'kitql-postgres')
	return {
		repo,
		worktree,
		db: dbName(repo, worktree),
		home,
		dataDir: path.join(home, 'data'),
		logFile: path.join(home, 'postgres.log'),
		stateFile: path.join(home, 'state.json'),
	}
}

/**
 * Ask git where we are.
 * @param {string} cwd
 * @returns {GitInfo}
 */
export function readGitInfo(cwd) {
	const res = spawnSync(
		'git',
		['rev-parse', '--path-format=absolute', '--git-common-dir', '--git-dir'],
		{ cwd, encoding: 'utf-8' },
	)
	if (res.error) {
		throw new Error(`git is required to locate the repo (${res.error.message})`)
	}
	if (res.status !== 0) {
		throw new Error(
			`not inside a git repository (${cwd}).\n` +
				`kitql-postgres keeps one server per repo, run it from a git checkout.`,
		)
	}
	const [commonDir, gitDir] = res.stdout.trim().split(NEW_LINE)
	return { commonDir: path.resolve(cwd, commonDir), gitDir: path.resolve(cwd, gitDir) }
}

/**
 * @param {string} cwd
 * @param {Record<string, string | undefined>} env
 */
export function resolveContext(cwd, env) {
	return buildContext(readGitInfo(cwd), env)
}
