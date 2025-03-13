import { describe, expect, it } from 'vitest'

import { nullifyImports } from './transformPackage.js'

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

		expect(transformed).toMatchInlineSnapshot(`
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
			    "Nullify imports from 'mongodb'",
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

		expect(transformed).toMatchInlineSnapshot(`
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
			    "Nullify imports from 'mongodb'",
			  ],
			}
		`)
	})

	it('should NOT strip imports that are used in exports', async () => {
		const code = `import { ObjectId } from 'mongodb'
import { createId } from '@paralleldrive/cuid2'

// This import is used in an export, so it should not be nullified
export { createId }

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

		const transformed = await nullifyImports(code, ['mongodb', '@paralleldrive/cuid2'])

		expect(transformed).toMatchInlineSnapshot(`
			{
			  "code": "import { createId } from "@paralleldrive/cuid2";
			let ObjectId = null;
			export { createId };

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
			    "Nullify imports from 'mongodb'",
			  ],
			}
		`)
	})

	it('should handle mixed exports and nullifications from the same module', async () => {
		const code = `import { ObjectId, createId, connect } from 'mongodb'

// Only createId is exported, the others should be nullified
export { createId }

@Entity('tasks', {
  allowApiCrud: true
})
export class Task {
  @Fields.string({
    valueConverter: {
      fromDb: (x) => x?.toString(),
      toDb: (x) => {
        const r = new ObjectId(x)
        connect()
        return r
      }
    }
  })
  aMongoDbIdField = ''
}
`

		const transformed = await nullifyImports(code, ['mongodb'])

		expect(transformed).toMatchInlineSnapshot(`
			{
			  "code": "import { createId } from "mongodb";
			let ObjectId = null;
			let connect = null;
			export { createId };

			@Entity("tasks", {
			    allowApiCrud: true
			})
			export class Task {
			    @Fields.string({
			        valueConverter: {
			            fromDb: x => x?.toString(),

			            toDb: x => {
			                const r = new ObjectId(x);
			                connect();
			                return r;
			            }
			        }
			    })
			    aMongoDbIdField = "";
			}",
			  "info": [
			    "Nullify imports from 'mongodb'",
			  ],
			}
		`)
		// We expect:
		// 1. createId to be preserved as an import because it's exported
		// 2. ObjectId and connect to be nullified
	})
})
