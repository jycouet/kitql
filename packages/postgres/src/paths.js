import { spawnSync } from 'node:child_process'
import path from 'node:path'

import { dbName } from './naming.js'

const TRAILING_SEPARATORS = /[\\/]+$/
const GIT_SUFFIX = /\.git$/
const NEW_LINE = /\r?\n/
const REMOTE_NAME = /([^/:\\]+?)(?:\.git)?[/\\]*$/

/**
 * @typedef {object} GitInfo
 * @property {string} commonDir `git rev-parse --git-common-dir` (absolute), shared by all worktrees
 * @property {string} gitDir `git rev-parse --git-dir` (absolute), per worktree
 * @property {string} [remoteUrl] `git config remote.origin.url`, if any
 * @property {string} [toplevel] root of the current checkout
 */

/**
 * @typedef {object} Context
 * @property {string} repo repo name (origin remote, or folder of the main worktree)
 * @property {string} worktree worktree name (`main` for the main worktree)
 * @property {string} mainDb main's database (`<repo>`), used by every worktree by default
 * @property {string | undefined} ownDb the worktree's own database (`<repo>_<worktree>`), if it
 *   exists the worktree uses it. undefined in the main worktree
 * @property {string} home folder holding everything of the repo server
 * @property {string} dataDir postgres data directory (PGDATA)
 * @property {string} logFile server log
 * @property {string} stateFile kitql-pg settings (port, ...)
 * @property {string | undefined} root root of the current checkout (holds the package.json config)
 */

/** @param {string} p */
function same(p) {
	const resolved = path.resolve(p).replace(TRAILING_SEPARATORS, '')
	return process.platform === 'win32' ? resolved.toLowerCase() : resolved
}

/**
 * Repo name of a remote url: `git@github.com:jycouet/kimbia.app.git` -> `kimbia.app`
 * @param {string} url
 */
export function repoFromRemote(url) {
	return REMOTE_NAME.exec(url.trim())?.[1] ?? ''
}

/**
 * Repo & worktree names out of git dirs.
 * - repo: the origin remote name when there is one (checkout folders are often just `main/`)
 * - main worktree: `<repo>/.git` -> repo `<repo>`, worktree `main`
 * - linked worktree: git dir `<repo>/.git/worktrees/<name>` -> worktree `<name>` (git keeps it unique)
 * - bare repo: `<repo>.git` -> repo `<repo>`
 * @param {GitInfo} git
 */
export function parseGitInfo(git) {
	const commonBase = path.basename(git.commonDir)
	const repo =
		(git.remoteUrl && repoFromRemote(git.remoteUrl)) ||
		(commonBase === '.git'
			? path.basename(path.dirname(git.commonDir))
			: commonBase.replace(GIT_SUFFIX, ''))
	const isMain = same(git.gitDir) === same(git.commonDir)
	const worktree = isMain ? 'main' : path.basename(git.gitDir)
	return { repo, worktree, isMain }
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
	const { repo, worktree, isMain } = parseGitInfo(git)
	const home = env.KITQL_PG_HOME
		? path.resolve(env.KITQL_PG_HOME)
		: path.join(git.commonDir, 'kitql-postgres')
	return {
		repo,
		worktree,
		mainDb: dbName(repo),
		ownDb: isMain ? undefined : dbName(repo, worktree),
		home,
		dataDir: path.join(home, 'data'),
		logFile: path.join(home, 'postgres.log'),
		stateFile: path.join(home, 'state.json'),
		root: git.toplevel,
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
				`kitql-pg keeps one server per repo, run it from a git checkout.`,
		)
	}
	const [commonDir, gitDir] = res.stdout.trim().split(NEW_LINE)
	/** @param {string[]} args */
	const optional = (args) => {
		const r = spawnSync('git', args, { cwd, encoding: 'utf-8' })
		return r.status === 0 ? r.stdout.trim() : undefined
	}
	return {
		commonDir: path.resolve(cwd, commonDir),
		gitDir: path.resolve(cwd, gitDir),
		remoteUrl: optional(['config', '--get', 'remote.origin.url']),
		// fails outside of a checkout (inside .git, bare repo)
		toplevel: optional(['rev-parse', '--show-toplevel']),
	}
}

/**
 * @param {string} cwd
 * @param {Record<string, string | undefined>} env
 */
export function resolveContext(cwd, env) {
	return buildContext(readGitInfo(cwd), env)
}
