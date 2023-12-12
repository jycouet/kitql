import { describe, expect, it } from 'vitest'

import { removeUnusedImports, transformDecorator } from './transformDecorator.js'

describe('decorator', () => {
  it('should empty @BackendMethod and clean imports', async () => {
    const code = `import { Allow, BackendMethod, remult } from "remult";
import { Task } from "./task";
import { AUTH_SECRET } from "$env/static/private";

export class TasksController {
	static async yop1(completed: boolean) {
		const taskRepo = remult.repo(Task);
	}

	@BackendMethod({ allowed: Allow.authenticated })
	static async setAllCompleted(completed: boolean) {
		console.log("AUTH_SECRET", AUTH_SECRET);

		const taskRepo = remult.repo(Task);
		for (const task of await taskRepo.find()) {
			await taskRepo.save({ ...task, completed });
		}
	}

	@BackendMethod({ allowed: Allow.authenticated })
	static async Yop(completed: boolean) {
		// console.log("AUTH_SECRET", AUTH_SECRET);

		const taskRepo = remult.repo(Task);
		for (const task of await taskRepo.find()) {
			await taskRepo.save({ ...task, completed });
		}
	}
}
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { remult, BackendMethod, Allow } from \\"remult\\";
      import { Task } from \\"./task\\";

      export class TasksController {
          static async yop1(completed: boolean) {
              const taskRepo = remult.repo(Task);
          }

          @BackendMethod({
              allowed: Allow.authenticated
          })
          static async setAllCompleted(completed: boolean) {}

          @BackendMethod({
              allowed: Allow.authenticated
          })
          static async Yop(completed: boolean) {}
      }",
        "info": [
          "Striped: 'BackendMethod'",
          "Striped: 'BackendMethod'",
          "Removed: 'AUTH_SECRET' from '$env/static/private'",
        ],
      }
    `)
  })

  it('should not crash if there is an error in the original file', async () => {
    const code = `import { Allow, BackendMethod, remult } from "remult";
import { Task } from "./task";
import { AUTH_SECRET } from "$env/static/private";

export class TasksController {
	@BackendMethod({ allowed: Allow.authenticated })
	static async setAllCompleted(completed: boolean) {
		console.log("AUTH_SECRET", AUTH_SECRET);
	//} LEAVE THIS ERROR TO SIMULATE A WRONG PARSED FILE
}
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
    {
      "code": "import { Allow, BackendMethod, remult } from \\"remult\\";
    import { Task } from \\"./task\\";
    import { AUTH_SECRET } from \\"$env/static/private\\";

    export class TasksController {
    	@BackendMethod({ allowed: Allow.authenticated })
    	static async setAllCompleted(completed: boolean) {
    		console.log(\\"AUTH_SECRET\\", AUTH_SECRET);
    	//} LEAVE THIS ERROR TO SIMULATE A WRONG PARSED FILE
    }
    	",
      "transformed": false,
    }
  `)
  })

  it('should not do anything as there is no @BackendMethod', async () => {
    const code = `import { Allow, BackendMethod, remult } from "remult";
import { Task } from "./task";
import { AUTH_SECRET } from "$env/static/private";

export class TasksController {
	static async yop1(completed: boolean) {
		const taskRepo = remult.repo(Task);
	}

	static async setAllCompleted(completed: boolean) {
		console.log("AUTH_SECRET", AUTH_SECRET);

		const taskRepo = remult.repo(Task);
		for (const task of await taskRepo.find()) {
			await taskRepo.save({ ...task, completed });
		}
	}
}
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { AUTH_SECRET } from \\"$env/static/private\\";

      export class TasksController {
          static async yop1(completed: boolean) {}

          static async setAllCompleted(completed: boolean) {
              console.log(\\"AUTH_SECRET\\", AUTH_SECRET);

              for ( of await taskRepo.find()) {
                  await taskRepo.save({
                      ...task,
                      completed
                  });
              }
          }
      }",
        "transformed": false,
      }
    `)
  })

  it('should strip also unused methods', async () => {
    const code = `import { TOP_SECRET, TOP_SECRET_NOT_USED } from '$env/static/private';
  import { stry0 } from '@kitql/helper';
  import { BackendMethod, Entity, Fields, remult } from 'remult';
  
  @Entity<Ent>()
  export class Ent {
    @Fields.uuid()
    id!: string;
  }
  
  const getInfo = () => {
    const client = {}

    console.log(TOP_SECRET)
  
    return client;
  };
  
  export class EntController {
    @BackendMethod({ allowed: false })
    static async init(hello: string) {  
      const client = getInfo();
  
      // Do a lot of things here
    }
  }  
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { BackendMethod, Entity, Fields } from \\"remult\\";

      @Entity<Ent>()
      export class Ent {
          @Fields.uuid()
          id!: string;
      }

      export class EntController {
          @BackendMethod({
              allowed: false
          })
          static async init(hello: string) {}
      }",
        "transformed": true,
      }
    `)
  })

  it('should strip just the right things', async () => {
    const code = `import { Allow, BackendMethod, Entity, Fields, Validators } from 'remult'

    @Entity<User>('userstest', {
      allowApiCrud: Allow.authenticated,
    })
    export class User2 {
      @Fields.uuid()
      id = ''
    
      @Fields.string({
        validate: [Validators.required, Validators.uniqueOnBackend],
      })
      email = ''
    
      @BackendMethod({ allowed: Allow.everyone })
      async testMethod() {
        console.log('hello')
      }
    }
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { Allow, BackendMethod, Entity, Fields, Validators } from \\"remult\\";

      @Entity<User>(\\"userstest\\", {
          allowApiCrud: Allow.authenticated
      })
      export class User2 {
          @Fields.uuid()
          id = \\"\\";

          @Fields.string({
              validate: [Validators.required, Validators.uniqueOnBackend]
          })
          email = \\"\\";

          @BackendMethod({
              allowed: Allow.everyone
          })
          async testMethod() {}
      }",
        "transformed": true,
      }
    `)
  })

  it('should strip unused stuff v1', async () => {
    const code = `import { Allow, BackendMethod, Entity, Fields, Validators } from 'remult'

    @Entity<User>('userstest', {
      allowApiCrud: Allow.authenticated,
    })
    export class User2 {
      @Fields.uuid()
      id = ''
    
      @Fields.string({})
      email = ''
    
      @BackendMethod({ allowed: Allow.everyone })
      async testMethod() {
        console.log('hello')
      }
    }
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { Allow, BackendMethod, Entity, Fields } from \\"remult\\";

      @Entity<User>(\\"userstest\\", {
          allowApiCrud: Allow.authenticated
      })
      export class User2 {
          @Fields.uuid()
          id = \\"\\";

          @Fields.string({})
          email = \\"\\";

          @BackendMethod({
              allowed: Allow.everyone
          })
          async testMethod() {}
      }",
        "transformed": true,
      }
    `)
  })

  it('should strip imports that are in the BackendMethod', async () => {
    const code = `import { Allow, BackendMethod, Entity, Fields, Validators } from 'remult'

    @Entity<User>('userstest', {
      allowApiCrud: Allow.authenticated,
    })
    export class User2 {
      @Fields.uuid()
      id = ''
    
      @Fields.string({})
      email = ''
    
      @BackendMethod({ allowed: Allow.everyone })
      async testMethod() {
        console.log('hello', Validators.required)
      }
    }
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { Allow, BackendMethod, Entity, Fields } from \\"remult\\";

      @Entity<User>(\\"userstest\\", {
          allowApiCrud: Allow.authenticated
      })
      export class User2 {
          @Fields.uuid()
          id = \\"\\";

          @Fields.string({})
          email = \\"\\";

          @BackendMethod({
              allowed: Allow.everyone
          })
          async testMethod() {}
      }",
        "transformed": true,
      }
    `)
  })

  it('should NOT strip imports that are in both in BackendMethod and not in', async () => {
    const code = `import { Allow, BackendMethod, Entity, Fields, Validators } from 'remult'

    @Entity<User>('userstest', {
      allowApiCrud: Allow.authenticated,
    })
    export class User2 {
      @Fields.uuid()
      id = ''
    
      @Fields.string({
        validate: [Validators.required, Validators.uniqueOnBackend],
      })
      email = ''
    
      @BackendMethod({ allowed: Allow.everyone })
      async testMethod() {
        console.log('hello', Validators.required)
      }
    }
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { Allow, BackendMethod, Entity, Fields, Validators } from \\"remult\\";

      @Entity<User>(\\"userstest\\", {
          allowApiCrud: Allow.authenticated
      })
      export class User2 {
          @Fields.uuid()
          id = \\"\\";

          @Fields.string({
              validate: [Validators.required, Validators.uniqueOnBackend]
          })
          email = \\"\\";

          @BackendMethod({
              allowed: Allow.everyone
          })
          async testMethod() {}
      }",
        "transformed": true,
      }
    `)
  })

  it('should strip unused stuff v2', async () => {
    const code = `import { ObjectId } from "mongodb";
    import { Entity, Field, Fields, remult, Relations, FieldOptions } from "remult";
    import { runDemo } from "./utils/run-demo";
    
    for (const task of await taskRepo.find()) {
			await taskRepo.save({ ...task, completed });
		}

    @Entity<Customer>("customers")
    export class Customer {
      @Fields.string({
        dbName: "_id",
        valueConverter: {
          fieldTypeInDb: "dbid",
        },
      })
      id = "";
      @Fields.string()
      name = "";
      @Fields.string()
      city = "";
    }
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { Entity, Fields } from \\"remult\\";

      for ( of await taskRepo.find()) {
          await taskRepo.save({
              ...task,
              completed
          });
      }

      @Entity<Customer>(\\"customers\\")
      export class Customer {
          @Fields.string({
              dbName: \\"_id\\",

              valueConverter: {
                  fieldTypeInDb: \\"dbid\\"
              }
          })
          id = \\"\\";

          @Fields.string()
          name = \\"\\";

          @Fields.string()
          city = \\"\\";
      }",
        "transformed": false,
      }
    `)
  })

  it('should strip unused stuff v3', async () => {
    const code = `import { ObjectId } from "mongodb";
    import { Entity, Field, Fields, remult, Relations, FieldOptions } from "remult";
    import { runDemo } from "./utils/run-demo";
    import "reflect-metadata";

    @Entity<Customer>("customers")
    export class Customer {
      @Fields.string({
        dbName: "_id",
        valueConverter: {
          fieldTypeInDb: "dbid",
        },
      })
      id = "";
      @Fields.string()
      name = "";
      @Fields.string()
      city = "";
    }
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { Entity, Fields } from \\"remult\\";

      @Entity<Customer>(\\"customers\\")
      export class Customer {
          @Fields.string({
              dbName: \\"_id\\",

              valueConverter: {
                  fieldTypeInDb: \\"dbid\\"
              }
          })
          id = \\"\\";

          @Fields.string()
          name = \\"\\";

          @Fields.string()
          city = \\"\\";
      }",
        "transformed": false,
      }
    `)
  })

  it('should strip unused stuff v4', async () => {
    const code = `import { ObjectId } from "mongodb";
    import { Entity, Field, Fields, remult, Relations, FieldOptions } from "remult";
    import { runDemo } from "./utils/run-demo";
    import "reflect-metadata";
    import * as yop from 'yop'

    console.log(yop)
	`

    const transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import * as yop from \\"yop\\";
      console.log(yop);",
        "transformed": false,
      }
    `)
  })
})
