import { describe, expect, it } from 'vitest'

import { skipMissingExtensions } from './restore.js'

const TOC = `;
; Selected TOC Entries:
;
3; 3079 16422 EXTENSION - hstore 
5173; 0 0 COMMENT - EXTENSION hstore 
2; 3079 16384 EXTENSION - uuid-ossp 
5174; 0 0 COMMENT - EXTENSION "uuid-ossp" 
955; 1247 16551 TYPE public carbone_template_extension_enum postgres
221; 1259 16553 TABLE public t postgres
`

describe('skipMissingExtensions', () => {
	it('drops missing extensions and their comment only', () => {
		const { list, skipped } = skipMissingExtensions(TOC, ['hstore', 'pgcrypto'])
		expect(skipped).toEqual(['uuid-ossp'])
		expect(list).not.toContain('uuid-ossp')
		expect(list).toContain('EXTENSION - hstore')
		expect(list).toContain('COMMENT - EXTENSION hstore')
		expect(list).toContain('carbone_template_extension_enum')
		expect(list).toContain('TABLE public t')
	})

	it('keeps everything when all are available', () => {
		const { list, skipped } = skipMissingExtensions(TOC, ['hstore', 'uuid-ossp'])
		expect(skipped).toEqual([])
		expect(list).toBe(TOC)
	})
})
