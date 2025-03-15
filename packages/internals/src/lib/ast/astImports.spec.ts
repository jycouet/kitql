import { describe, expect, it } from 'vitest'

import { imports } from './astImports.js'

describe('imports', () => {
	it('should return an import a', () => {
		const data = imports('import { a } from "lib"')
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "localName": undefined,
			    "name": "a",
			    "source": "lib",
			    "type": "named",
			  },
			]
		`)
	})

	it('should return an import a and b', () => {
		const data = imports('import { a, b } from "lib"')
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "localName": undefined,
			    "name": "a",
			    "source": "lib",
			    "type": "named",
			  },
			  {
			    "localName": undefined,
			    "name": "b",
			    "source": "lib",
			    "type": "named",
			  },
			]
		`)
	})

	it('should return an import a and b and c as d', () => {
		const data = imports('import { a, b, c as d } from "lib"')
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "localName": undefined,
			    "name": "a",
			    "source": "lib",
			    "type": "named",
			  },
			  {
			    "localName": undefined,
			    "name": "b",
			    "source": "lib",
			    "type": "named",
			  },
			  {
			    "localName": "d",
			    "name": "c",
			    "source": "lib",
			    "type": "named",
			  },
			]
		`)
	})

	it('should return an import a and type b', () => {
		const data = imports('import { a, type b } from "lib"')
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "localName": undefined,
			    "name": "a",
			    "source": "lib",
			    "type": "named",
			  },
			  {
			    "localName": undefined,
			    "name": "b",
			    "source": "lib",
			    "type": "type",
			  },
			]
		`)
	})

	it('should return an import types a and b', () => {
		const data = imports('import type { a, b } from "lib"')
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "localName": undefined,
			    "name": "a",
			    "source": "lib",
			    "type": "type",
			  },
			  {
			    "localName": undefined,
			    "name": "b",
			    "source": "lib",
			    "type": "type",
			  },
			]
		`)
	})

	it('should return * stuff as toto', () => {
		const data = imports('import * as toto from "lib"')
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "name": "toto",
			    "source": "lib",
			    "type": "namespace",
			  },
			]
		`)
	})

	it('should handle bare imports', () => {
		const data = imports('import "lib"')
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "name": "default",
			    "source": "lib",
			    "type": "default",
			  },
			]
		`)
	})

	it('should handle named imports', () => {
		const data = imports(`import { default as Icon } from './ui/Icon.svelte'`)
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "localName": "Icon",
			    "name": "default",
			    "source": "./ui/Icon.svelte",
			    "type": "named",
			  },
			]
		`)
	})

	it('should handle default imports', () => {
		const data = imports('import DefaultExport from "lib"')
		expect(data.importsList).toMatchInlineSnapshot(`
			[
			  {
			    "name": "DefaultExport",
			    "source": "lib",
			    "type": "default",
			  },
			]
		`)
	})
})