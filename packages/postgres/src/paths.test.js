import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildContext, parseGitInfo, repoFromRemote } from './paths.js'

describe('repoFromRemote', () => {
	it('ssh, https, with or without .git', () => {
		expect(repoFromRemote('git@github.com:jycouet/kimbia.app.git')).toBe('kimbia.app')
		expect(repoFromRemote('https://github.com/jycouet/kitql.git')).toBe('kitql')
		expect(repoFromRemote('https://github.com/jycouet/kitql/')).toBe('kitql')
		expect(repoFromRemote('ssh://git@host:22/team/my-app')).toBe('my-app')
		expect(repoFromRemote('C:\\repos\\local')).toBe('local')
		expect(repoFromRemote('../local.git')).toBe('local')
	})
})

describe('yved layout (`<project>/main/` checkouts)', () => {
	const remoteUrl = 'git@github.com:jycouet/kimbia.app.git'

	it('main checkout with a .git dir', () => {
		const ctx = buildContext({
			commonDir: '/y/kimbia.app/main/.git',
			gitDir: '/y/kimbia.app/main/.git',
			remoteUrl,
		})
		expect(ctx.mainDb).toBe('kimbia_app')
		expect(ctx.ownDb).toBe(undefined)
	})

	it('worktree next to a .bare dir', () => {
		const ctx = buildContext({
			commonDir: '/y/kimbia.app/.bare',
			gitDir: '/y/kimbia.app/.bare/worktrees/wt-05',
			remoteUrl,
		})
		expect(ctx.mainDb).toBe('kimbia_app')
		expect(ctx.ownDb).toBe('kimbia_app_wt_05')
		expect(ctx.dataDir).toBe(path.join('/y/kimbia.app/.bare', 'kitql-postgres', 'data'))
	})

	it('no remote: falls back to the folder', () => {
		expect(parseGitInfo({ commonDir: '/y/kitql/.git', gitDir: '/y/kitql/.git' }).repo).toBe('kitql')
	})
})

describe('parseGitInfo', () => {
	it('main worktree', () => {
		expect(parseGitInfo({ commonDir: '/dev/kitql/.git', gitDir: '/dev/kitql/.git' })).toEqual({
			repo: 'kitql',
			worktree: 'main',
			isMain: true,
		})
	})

	it('main worktree, trailing slash', () => {
		expect(parseGitInfo({ commonDir: '/dev/kitql/.git', gitDir: '/dev/kitql/.git/' }).worktree).toBe(
			'main',
		)
	})

	it('linked worktree uses the git worktree name', () => {
		expect(
			parseGitInfo({
				commonDir: '/dev/kitql/.git',
				gitDir: '/dev/kitql/.git/worktrees/feat-kitql-postgres',
			}),
		).toEqual({ repo: 'kitql', worktree: 'feat-kitql-postgres', isMain: false })
	})

	it('bare repo', () => {
		expect(
			parseGitInfo({ commonDir: '/dev/kitql.git', gitDir: '/dev/kitql.git/worktrees/fix' }),
		).toEqual({ repo: 'kitql', worktree: 'fix', isMain: false })
	})
})

describe('buildContext', () => {
	const git = { commonDir: '/dev/kitql/.git', gitDir: '/dev/kitql/.git/worktrees/fix-1' }

	it('stores everything in the git common dir', () => {
		const ctx = buildContext(git)
		expect(ctx.mainDb).toBe('kitql')
		expect(ctx.ownDb).toBe('kitql_fix_1')
		expect(ctx.home).toBe(path.join('/dev/kitql/.git', 'kitql-postgres'))
		expect(ctx.dataDir).toBe(path.join(ctx.home, 'data'))
		expect(ctx.stateFile).toBe(path.join(ctx.home, 'state.json'))
	})

	it('every worktree shares the same server', () => {
		const main = buildContext({ commonDir: git.commonDir, gitDir: git.commonDir })
		expect(main.dataDir).toBe(buildContext(git).dataDir)
		expect(main.mainDb).toBe('kitql')
		expect(main.ownDb).toBe(undefined)
	})

	it('KITQL_PG_HOME overrides the location', () => {
		const ctx = buildContext(git, { KITQL_PG_HOME: '/tmp/pg' })
		expect(ctx.dataDir).toBe(path.join(path.resolve('/tmp/pg'), 'data'))
	})
})
