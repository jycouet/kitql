import { describe, expect, it } from 'vitest'

import { dbName, MAX_IDENTIFIER_LENGTH, quoteIdent, quoteLiteral, sanitize } from './naming.js'

describe('sanitize', () => {
	it('lowercases and replaces separators', () => {
		expect(sanitize('Feat/My-Branch')).toBe('feat_my_branch')
		expect(sanitize('kitql.dev')).toBe('kitql_dev')
	})

	it('collapses and trims underscores', () => {
		expect(sanitize('--a__b  c--')).toBe('a_b_c')
	})

	it('drops accents', () => {
		expect(sanitize('Café-Crème')).toBe('cafe_creme')
	})
})

describe('dbName', () => {
	it("main's db is the repo, a worktree's own db is repo_worktree", () => {
		expect(dbName('kimbia.app')).toBe('kimbia_app')
		expect(dbName('kimbia.app', 'wt-05')).toBe('kimbia_app_wt_05')
	})

	it('never starts with a digit', () => {
		expect(dbName('2024-app')).toBe('db_2024_app')
	})

	it('falls back on empty parts', () => {
		expect(dbName('***')).toBe('repo')
		expect(dbName('***', '')).toBe('repo_wt')
	})

	it('stays unique and short for long names', () => {
		const a = dbName('my-very-long-repository-name', 'feature-with-an-extremely-long-branch-name-1')
		const b = dbName('my-very-long-repository-name', 'feature-with-an-extremely-long-branch-name-2')
		expect(a.length).toBe(MAX_IDENTIFIER_LENGTH)
		expect(a).not.toBe(b)
		expect(a).toMatch(/^[a-z0-9_]+$/)
	})
})

describe('quote', () => {
	it('quotes identifiers', () => {
		expect(quoteIdent('my"db')).toBe('"my""db"')
	})

	it('quotes literals', () => {
		expect(quoteLiteral("it's")).toBe("'it''s'")
	})
})
