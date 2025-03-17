import { describe, expect, it } from 'vitest'

import { nullifyImports } from './nullifyImports.js'
import { toInfoCode } from './testHelper.js'

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

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
      {
        "code": "let ObjectId = null;

      @Entity("tasks", {
          allowApiCrud: true
      })
      export class Task {
          @Fields.string({
              valueConverter: {
                  fromDb: x => x?.toString(),

                  toDb: x => {
                      const r = new ObjectId(x);
                      console.log(r);
                      return r;
                  }
              }
          })
          aMongoDbIdField = "";
      }",
        "info": [
          "Nullify import from 'mongodb'",
        ],
      }
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

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
      {
        "code": "let ObjectId = null;
      let demo = null;

      @Entity("tasks", {
          allowApiCrud: true
      })
      export class Task {
          @Fields.string({
              valueConverter: {
                  fromDb: x => x?.toString(),

                  toDb: x => {
                      const r = new ObjectId(x);
                      const u = demo;
                  }
              }
          })
          aMongoDbIdField = "";
      }",
        "info": [
          "Nullify import from 'mongodb'",
        ],
      }
    `)
	})
})
