import { describe, expect, it } from 'vitest'

import { removePackages } from './transformPackage.js'

describe('package', () => {
  it('rmv lib', async () => {
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

    const transformed = await removePackages(code, ['mongodb'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "@Entity(\\"tasks\\", {
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
          aMongoDbIdField = \\"\\";
      }",
        "info": [
          "Striped: 'mongodb'",
        ],
      }
    `)
  })
})
