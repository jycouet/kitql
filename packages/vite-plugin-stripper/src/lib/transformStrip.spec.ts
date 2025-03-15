import { describe, expect, it } from "vitest";
import { transformStrip } from "./transformStrip.js";
import { nullifyImports } from "./nullifyImports.js";

describe("transformStrip (init)", () => {
  it("should add import.meta.env.SSR and log the performance bad import", async () => {
    const code = `
import { BackendMethod, remult, type Allowed } from 'remult'
import { performance } from 'perf_hooks'

const helpers = async () => {
	const { AUTH_SECRET } = await import('$env/static/private')
	return { AUTH_SECRET }
}

export class ActionsController {
	@BackendMethod({ allowed: () => remult.user === undefined })
	static async read(info: Allowed) {
		// if (import.meta.env.SSR) {
		const { plop } = await import('./toto.js')
		const { AUTH_SECRET } = await import('$env/static/private')
		helpers()
		const start = performance.now()
		console.info('AUTH_SECRET', AUTH_SECRET)
		const end = performance.now()
		console.info(end - start)
		plop()
		return AUTH_SECRET + ' ' + info
		// }
	}
}
`;

    const data = await transformStrip(code, [{ decorator: "BackendMethod" }]);
    expect(data).toMatchInlineSnapshot(`
			{
			  "code": "import { BackendMethod, remult, type Allowed } from "remult";
			import { performance } from "perf_hooks";

			const helpers = async () => {
			    const {
			        AUTH_SECRET
			    } = await import("$env/static/private");

			    return {
			        AUTH_SECRET
			    };
			};

			export class ActionsController {
			    @BackendMethod({
			        allowed: () => remult.user === undefined
			    })
			    static async read(info: Allowed) {
			        if (import.meta.env.SSR) {
			            const {
			                plop
			            } = await import("./toto.js");

			            const {
			                AUTH_SECRET
			            } = await import("$env/static/private");

			            helpers();
			            const start = performance.now();
			            console.info("AUTH_SECRET", AUTH_SECRET);
			            const end = performance.now();
			            console.info(end - start);
			            plop();
			            return AUTH_SECRET + " " + info;
			        }
			    }
			}",
			  "info": [
			    "Wrapped with if(import.meta.env.SSR): ["ActionsController","BackendMethod","read"]",
			  ],
			}
		`);
  });
});

describe("transformStrip", () => {
  it("should empty @BackendMethod and clean imports", async () => {
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
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });

  it("should not crash if there is an error in the original file", async () => {
    const code = `import { Allow, BackendMethod, remult } from "remult";
import { Task } from "./task";
import { AUTH_SECRET } from "$env/static/private";

export class TasksController {
	@BackendMethod({ allowed: Allow.authenticated })
	static async setAllCompleted(completed: boolean) {
		console.log("AUTH_SECRET", AUTH_SECRET);
	//} LEAVE THIS ERROR TO SIMULATE A WRONG PARSED FILE
}
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });

  it("should not do anything as there is no @BackendMethod", async () => {
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
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });

  it("should strip also unused methods", async () => {
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
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });

  it("should strip just the right things", async () => {
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
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });

  it("should strip unused stuff when decorator", async () => {
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
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });

  it("should strip imports that are in the BackendMethod", async () => {
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
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });

  it("should NOT strip imports that are in both in BackendMethod and not in", async () => {
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
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });

  it("should strip import types", async () => {
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
    
	`;

    const transformed = await transformStrip(code, [
      { decorator: "BackendMethod" },
    ]);

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
    `);
  });
});

describe("decoratorEntity", () => {
  it("should strip @BackendMethod in @Entity", async () => {
    const code = `import { AUTH_SECRET, AUTH_SECRET_NOT_USED } from "$env/static/private";
import { BackendMethod, Entity, Fields, remult, type Allowed } from "remult";

@Entity('users', {
  backendPrefilter: async () => {
    console.log('backendPrefilter')
    return {}
  }
})
export class User {
	@Fields.uuid()
	id = ''

	@Fields.string()
	name = ''

	@BackendMethod({
		// Only unauthenticated users can call this method
		allowed: () => remult.user === undefined,
	})
	static async hi(info: Allowed) {
		console.info('AUTH_SECRET', AUTH_SECRET)
		return AUTH_SECRET + ' ' + info
	}
}
`;

    const code1 = await nullifyImports(code, ["$env/static/private"]);
    const transformed = await transformStrip(code1.code, [
      { decorator: "BackendMethod" },
      { decorator: "Entity", args_1: [{ fn: "backendPrefilter" }] },
    ]);
    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "let AUTH_SECRET = null;
      let AUTH_SECRET_NOT_USED = null;
      import { BackendMethod, Entity, Fields, remult, type Allowed } from "remult";

      @Entity("users", {
          backendPrefilter: async () => {
              if (import.meta.env.SSR) {
                  console.log("backendPrefilter");
                  return {};
              }
          }
      })
      export class User {
          @Fields.uuid()
          id = "";

          @Fields.string()
          name = "";

          @BackendMethod({
              allowed: () => remult.user === undefined
          })
          static async hi(info: Allowed) {
              if (import.meta.env.SSR) {
                  console.info("AUTH_SECRET", AUTH_SECRET);
                  return AUTH_SECRET + " " + info;
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["User","Entity","backendPrefilter"]",
          "Wrapped with if(import.meta.env.SSR): ["User","BackendMethod","hi"]",
        ],
      }
    `);
  });

  it("should strip @BackendMethod in @Entity with excludeEntityKeys", async () => {
    const code = `import { AUTH_SECRET, AUTH_SECRET_NOT_USED } from "$env/static/private";
import { BackendMethod, Entity, Fields, remult, type Allowed } from "remult";

@Entity('users', {
  backendPrefilter: () => {
    console.log('backendPrefilter')
    return {}
  }
})
export class User {
	@Fields.uuid()
	id = ''

	@Fields.string()
	name = ''

	@BackendMethod({
		// Only unauthenticated users can call this method
		allowed: () => remult.user === undefined,
	})
	static async hi(info: Allowed) {
		console.info('AUTH_SECRET', AUTH_SECRET)
		return AUTH_SECRET + ' ' + info
	}
}
`;

    const code1 = await nullifyImports(code, ["$env/static/private"]);
    const transformed = await transformStrip(code1.code, [
      { decorator: "BackendMethod" },
      {
        decorator: "Entity",
        args_1: [
          {
            fn: "backendPrefilter",
            excludeEntityKeys: ["users"],
          },
        ],
      },
    ]);
    expect(transformed).toMatchInlineSnapshot(`
      {
        "code": "let AUTH_SECRET = null;
      let AUTH_SECRET_NOT_USED = null;
      import { BackendMethod, Entity, Fields, remult, type Allowed } from "remult";

      @Entity("users", {
          backendPrefilter: () => {
              console.log("backendPrefilter");
              return {};
          }
      })
      export class User {
          @Fields.uuid()
          id = "";

          @Fields.string()
          name = "";

          @BackendMethod({
              allowed: () => remult.user === undefined
          })
          static async hi(info: Allowed) {
              if (import.meta.env.SSR) {
                  console.info("AUTH_SECRET", AUTH_SECRET);
                  return AUTH_SECRET + " " + info;
              }
          }
      }",
        "info": [
          "Wrapped with if(import.meta.env.SSR): ["User","BackendMethod","hi"]",
        ],
      }
    `);
  });
});
