import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import { kitql } from '../eslint.config.js'

const lint = async (code) => {
	const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: kitql() })
	const [res] = await eslint.lintText(code, { filePath: 'src/lib/Ctrl.ts' })
	return res.messages.filter((m) => m.ruleId === 'no-restricted-syntax')
}

describe('no-restricted-syntax: !import.meta.env.SSR', () => {
	it('flags a negated SSR guard', async () => {
		const msgs = await lint(`export async function f() {
	if (!import.meta.env.SSR) throw new Error('server-only')
	return 1
}
`)
		expect(msgs).toHaveLength(1)
		expect(msgs[0].message).toContain('Do not use `!import.meta.env.SSR`')
	})

	it('allows wrapping in import.meta.env.SSR', async () => {
		const msgs = await lint(`export async function f() {
	if (import.meta.env.SSR) {
		return 1
	}
	throw new Error('server-only')
}
`)
		expect(msgs).toEqual([])
	})
})
