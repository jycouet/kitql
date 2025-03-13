import { describe, expect, it } from 'vitest'
import { imports } from './ast.js'

describe('imports', () => {
	it('should return an import a', () => {
		const data = imports('import { a } from "lib"')
		expect(data).toMatchInlineSnapshot(`
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
		expect(data).toMatchInlineSnapshot(`
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
		expect(data).toMatchInlineSnapshot(`
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
		expect(data).toMatchInlineSnapshot(`
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
		expect(data).toMatchInlineSnapshot(`
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
		expect(data).toMatchInlineSnapshot(`
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
		expect(data).toMatchInlineSnapshot(`
			[
			  {
			    "name": "default",
			    "source": "lib",
			    "type": "default",
			  },
			]
		`)

	})
})