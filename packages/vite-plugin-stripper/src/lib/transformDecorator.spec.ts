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

    let transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { Allow, BackendMethod, remult } from "remult";
      import { Task } from "./task";
      import { AUTH_SECRET } from "$env/static/private";

      export class TasksController {
          static async yop1(completed: boolean) {
              const taskRepo = remult.repo(Task);
          }

          @BackendMethod({
              allowed: Allow.authenticated
          })
          static async setAllCompleted(completed: boolean) {
              if (import.meta.env.SSR) {
                  console.log("AUTH_SECRET", AUTH_SECRET);
                  const taskRepo = remult.repo(Task);

                  for (const task of await taskRepo.find()) {
                      await taskRepo.save({
                          ...task,
                          completed
                      });
                  }
              }
          }

          @BackendMethod({
              allowed: Allow.authenticated
          })
          static async Yop(completed: boolean) {
              if (import.meta.env.SSR) {
                  const taskRepo = remult.repo(Task);

                  for (const task of await taskRepo.find()) {
                      await taskRepo.save({
                          ...task,
                          completed
                      });
                  }
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["TasksController","BackendMethod","setAllCompleted"]",
          "Wrapped with if(import.meta.env.SSR): ["TasksController","BackendMethod","Yop"]",
        ],
      }
    `)

    transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { Allow, BackendMethod, remult } from "remult";
      import { Task } from "./task";
      import { AUTH_SECRET } from "$env/static/private";

      export class TasksController {
          static async yop1(completed: boolean) {
              const taskRepo = remult.repo(Task);
          }

          @BackendMethod({
              allowed: Allow.authenticated
          })
          static async setAllCompleted(completed: boolean) {
              if (import.meta.env.SSR) {
                  console.log("AUTH_SECRET", AUTH_SECRET);
                  const taskRepo = remult.repo(Task);

                  for (const task of await taskRepo.find()) {
                      await taskRepo.save({
                          ...task,
                          completed
                      });
                  }
              }
          }

          @BackendMethod({
              allowed: Allow.authenticated
          })
          static async Yop(completed: boolean) {
              if (import.meta.env.SSR) {
                  const taskRepo = remult.repo(Task);

                  for (const task of await taskRepo.find()) {
                      await taskRepo.save({
                          ...task,
                          completed
                      });
                  }
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["TasksController","BackendMethod","setAllCompleted"]",
          "Wrapped with if(import.meta.env.SSR): ["TasksController","BackendMethod","Yop"]",
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

    let transformed = await transformDecorator(code, ['BackendMethod'])

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

    transformed = await transformDecorator(code, ['BackendMethod'])

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

    let transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { TOP_SECRET, TOP_SECRET_NOT_USED } from "$env/static/private";
      import { stry0 } from "@kitql/helper";
      import { BackendMethod, Entity, Fields, remult } from "remult";

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
          static async init(hello: string) {
              if (import.meta.env.SSR) {
                  const client = getInfo();
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["EntController","BackendMethod","init"]",
        ],
      }
    `)

    transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { TOP_SECRET, TOP_SECRET_NOT_USED } from "$env/static/private";
      import { stry0 } from "@kitql/helper";
      import { BackendMethod, Entity, Fields, remult } from "remult";

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
          static async init(hello: string) {
              if (import.meta.env.SSR) {
                  const client = getInfo();
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["EntController","BackendMethod","init"]",
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
        "code": "import { Allow, BackendMethod, Entity, Fields, Validators } from "remult";

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
          async testMethod() {
              if (import.meta.env.SSR) {
                  console.log("hello");
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["User2","BackendMethod","testMethod"]",
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
        "code": "import { Allow, BackendMethod, Entity, Fields, Validators } from "remult";

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
          async testMethod() {
              if (import.meta.env.SSR) {
                  console.log("hello");
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["User2","BackendMethod","testMethod"]",
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
        "code": "import { Allow, BackendMethod, Entity, Fields, Validators } from "remult";

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
          async testMethod() {
              if (import.meta.env.SSR) {
                  console.log("hello", Validators.required);
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["User2","BackendMethod","testMethod"]",
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
        "code": "import { Allow, BackendMethod, Entity, Fields, Validators } from "remult";

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
          async testMethod() {
              if (import.meta.env.SSR) {
                  console.log("hello", Validators.required);
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["User2","BackendMethod","testMethod"]",
        ],
      }
    `)
  })

  it('should strip import types', async () => {
    const code = `import { AUTH_SECRET } from '$env/static/private'
    import { BackendMethod, type Allowed, remult } from 'remult'
    
    export class ActionsController {
      @BackendMethod({
        // Only unauthenticated users can call this method
        allowed: () => remult.user === undefined,
      })
      static async read(info: Allowed) {
        console.log('AUTH_SECRET', AUTH_SECRET)
        return AUTH_SECRET + ' ' + info
      }
    }
    
	`

    let transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { AUTH_SECRET } from "$env/static/private";
      import { BackendMethod, type Allowed, remult } from "remult";

      export class ActionsController {
          @BackendMethod({
              allowed: () => remult.user === undefined
          })
          static async read(info: Allowed) {
              if (import.meta.env.SSR) {
                  console.log("AUTH_SECRET", AUTH_SECRET);
                  return AUTH_SECRET + " " + info;
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["ActionsController","BackendMethod","read"]",
        ],
      }
    `)

    transformed = await transformDecorator(code, ['BackendMethod'])

    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "import { AUTH_SECRET } from "$env/static/private";
      import { BackendMethod, type Allowed, remult } from "remult";

      export class ActionsController {
          @BackendMethod({
              allowed: () => remult.user === undefined
          })
          static async read(info: Allowed) {
              if (import.meta.env.SSR) {
                  console.log("AUTH_SECRET", AUTH_SECRET);
                  return AUTH_SECRET + " " + info;
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["ActionsController","BackendMethod","read"]",
        ],
      }
    `)
  })
})
