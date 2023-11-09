import { expect, it } from 'vitest'
import { transform } from './transform.js'

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

  const transformed = await transform(code, ['BackendMethod'])

  expect(transformed).toMatchInlineSnapshot(`
    {
      "code": "import { Allow, BackendMethod } from \\"remult\\";

    export class TasksController {
        static async yop1(completed: boolean) {}

        @BackendMethod({
            allowed: Allow.authenticated
        })
        static async setAllCompleted(completed: boolean) {}

        @BackendMethod({
            allowed: Allow.authenticated
        })
        static async Yop(completed: boolean) {}
    }",
      "transformed": true,
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

  const transformed = await transform(code, ['BackendMethod'])

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

  const transformed = await transform(code, ['BackendMethod'])

  expect(transformed).toMatchInlineSnapshot(`
    {
      "code": "import { Allow, BackendMethod, remult } from \\"remult\\";
    import { Task } from \\"./task\\";
    import { AUTH_SECRET } from \\"$env/static/private\\";

    export class TasksController {
        static async yop1(completed: boolean) {
            const taskRepo = remult.repo(Task);
        }

        static async setAllCompleted(completed: boolean) {
            console.log(\\"AUTH_SECRET\\", AUTH_SECRET);
            const taskRepo = remult.repo(Task);

            for (const task of await taskRepo.find()) {
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

  const transformed = await transform(code, ['BackendMethod'])

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
