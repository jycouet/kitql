import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { buildContext, parseGitInfo } from './paths.js'

describe('parseGitInfo', () => {
	it('main worktree', () => {
		expect(parseGitInfo({ commonDir: '/dev/kitql/.git', gitDir: '/dev/kitql/.git' })).toEqual({
			repo: 'kitql',
			worktree: 'main',
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
		).toEqual({ repo: 'kitql', worktree: 'feat-kitql-postgres' })
	})

	it('bare repo', () => {
		expect(
			parseGitInfo({ commonDir: '/dev/kitql.git', gitDir: '/dev/kitql.git/worktrees/fix' }),
		).toEqual({ repo: 'kitql', worktree: 'fix' })
	})
})

describe('buildContext', () => {
	const git = { commonDir: '/dev/kitql/.git', gitDir: '/dev/kitql/.git/worktrees/fix-1' }

	it('stores everything in the git common dir', () => {
		const ctx = buildContext(git)
		expect(ctx.db).toBe('kitql_fix_1')
		expect(ctx.home).toBe(path.join('/dev/kitql/.git', 'kitql-postgres'))
		expect(ctx.dataDir).toBe(path.join(ctx.home, 'data'))
		expect(ctx.stateFile).toBe(path.join(ctx.home, 'state.json'))
	})

	it('every worktree shares the same server', () => {
		const main = buildContext({ commonDir: git.commonDir, gitDir: git.commonDir })
		expect(main.dataDir).toBe(buildContext(git).dataDir)
		expect(main.db).toBe('kitql_main')
	})

	it('KITQL_PG_HOME overrides the location', () => {
		const ctx = buildContext(git, { KITQL_PG_HOME: '/tmp/pg' })
		expect(ctx.dataDir).toBe(path.join(path.resolve('/tmp/pg'), 'data'))
	})
})
