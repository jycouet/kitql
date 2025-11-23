import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-svelte'
import { page } from 'vitest/browser'

import Layout from './+layout.svelte'

describe('/+layout.svelte', () => {
	test('should render h1', () => {
		render(Layout)
		expect(page.getByRole('heading', { level: 1 })).toBeInTheDocument()
	})
})
