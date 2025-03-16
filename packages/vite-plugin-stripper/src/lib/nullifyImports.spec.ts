import { describe, expect, it } from 'vitest'

import { nullifyImports } from './nullifyImports.js'
import { print } from '@kitql/internals'

describe('package', () => {
	it('1 replace', async () => {
		const code = `import { ObjectId } from 'mongodb'
    @Entity('tasks', {
      allowApiCrud: true
    })
    export class Task {
      @Fields.string({
        valueConverter: {
          fromDb: (x) => x?.toString(),
          toDb: (x) => {
            const r = new ObjectId(x)
            console.log(r)
            return r
          }
        }
      })
      aMongoDbIdField = ''
    }
	`

		const transformed = await nullifyImports(code, ['mongodb'])

		expect(transformed.info).toMatchInlineSnapshot(`
			[
			  "Nullify 'ObjectId' from 'mongodb'",
			]
		`)
		expect(print(transformed.ast!.program).code).toMatchInlineSnapshot(`
			"let ObjectId = null;

			export class Task {
				aMongoDbIdField = '';
			}"
		`)
	})

	it('2 replaces', async () => {
		const code = `import { ObjectId, demo } from 'mongodb'
    @Entity('tasks', {
      allowApiCrud: true
    })
    export class Task {
      @Fields.string({
        valueConverter: {
          fromDb: (x) => x?.toString(),
          toDb: (x) => {
            const r = new ObjectId(x)
            const u = demo
          }
        }
      })
      aMongoDbIdField = ''
    }
	`

		const transformed = await nullifyImports(code, ['mongodb'])

		expect(transformed.info).toMatchInlineSnapshot(`
			[
			  "Nullify 'ObjectId' from 'mongodb'",
			  "Nullify 'demo' from 'mongodb'",
			]
		`)
		expect(print(transformed.ast!.program).code).toMatchInlineSnapshot(`
			"let ObjectId = null;
			let demo = null;

			export class Task {
				aMongoDbIdField = '';
			}"
		`)
	})
})
