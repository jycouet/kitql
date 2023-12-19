import { describe, expect, it } from 'vitest'

import { transformDecorator } from './transformDecorator.js'

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
        "code": "import { BackendMethod, Allow, remult } from "remult";
      import { Task } from "./task";

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
        "code": "import { Allow, BackendMethod, remult } from "remult";
      import { Task } from "./task";
      import { AUTH_SECRET } from "$env/static/private";

      export class TasksController {
      	@BackendMethod({ allowed: Allow.authenticated })
      	static async setAllCompleted(completed: boolean) {
      		console.log("AUTH_SECRET", AUTH_SECRET);
      	//} LEAVE THIS ERROR TO SIMULATE A WRONG PARSED FILE
      }
      	",
        "info": [],
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
        "code": "import { Allow, BackendMethod, remult } from "remult";
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
                  await taskRepo.save({
                      ...task,
                      completed
                  });
              }
          }
      }",
        "info": [],
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
        "code": "import { Entity, Fields, BackendMethod } from "remult";
      import { TOP_SECRET } from "$env/static/private";

      @Entity<Ent>()
      export class Ent {
          @Fields.uuid()
          id!: string;
      }

      const getInfo = () => {
          const client = {};
          console.log(TOP_SECRET);
          return client;
      };

      export class EntController {
          @BackendMethod({
              allowed: false
          })
          static async init(hello: string) {}
      }",
        "info": [
          "Striped: 'BackendMethod'",
          "Removed: 'TOP_SECRET_NOT_USED' from '$env/static/private'",
          "Removed: 'stry0' from '@kitql/helper'",
          "Removed: 'remult' from 'remult'",
        ],
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
        "code": "import { Entity, Allow, Fields, Validators, BackendMethod } from "remult";

      @Entity<User>("userstest", {
          allowApiCrud: Allow.authenticated
      })
      export class User2 {
          @Fields.uuid()
          id = "";

          @Fields.string({
              validate: [Validators.required, Validators.uniqueOnBackend]
          })
          email = "";

          @BackendMethod({
              allowed: Allow.everyone
          })
          async testMethod() {}
      }",
        "info": [
          "Striped: 'BackendMethod'",
        ],
      }
    `)
  })

  it('should strip unused stuff when decorator', async () => {
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
        "code": "import { Entity, Allow, Fields, BackendMethod } from "remult";

      @Entity<User>("userstest", {
          allowApiCrud: Allow.authenticated
      })
      export class User2 {
          @Fields.uuid()
          id = "";

          @Fields.string({})
          email = "";

          @BackendMethod({
              allowed: Allow.everyone
          })
          async testMethod() {}
      }",
        "info": [
          "Striped: 'BackendMethod'",
          "Removed: 'Validators' from 'remult'",
        ],
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
        "code": "import { Entity, Allow, Fields, BackendMethod } from "remult";

      @Entity<User>("userstest", {
          allowApiCrud: Allow.authenticated
      })
      export class User2 {
          @Fields.uuid()
          id = "";

          @Fields.string({})
          email = "";

          @BackendMethod({
              allowed: Allow.everyone
          })
          async testMethod() {}
      }",
        "info": [
          "Striped: 'BackendMethod'",
          "Removed: 'Validators' from 'remult'",
        ],
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
        "code": "import { Entity, Allow, Fields, Validators, BackendMethod } from "remult";

      @Entity<User>("userstest", {
          allowApiCrud: Allow.authenticated
      })
      export class User2 {
          @Fields.uuid()
          id = "";

          @Fields.string({
              validate: [Validators.required, Validators.uniqueOnBackend]
          })
          email = "";

          @BackendMethod({
              allowed: Allow.everyone
          })
          async testMethod() {}
      }",
        "info": [
          "Striped: 'BackendMethod'",
        ],
      }
    `)
  })
})
