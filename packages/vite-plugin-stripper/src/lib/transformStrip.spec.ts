import { describe, expect, it } from 'vitest'

import { nullifyImports } from './nullifyImports.js'
import { toInfoCode } from './testHelper.js'
import { transformStrip } from './transformStrip.js'

describe('transformStrip (init)', () => {
	it('should add import.meta.env.SSR and log the performance bad import', async () => {
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
`

		const data = await transformStrip(code, [{ decorator: 'BackendMethod' }])
		expect(toInfoCode(data)).toMatchInlineSnapshot(`
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
		`)
	})
})

describe('transformStrip', () => {
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(transformed).toMatchInlineSnapshot(`
      {
        "code_ast": Node {
          "comments": [
            {
              "end": 673,
              "loc": SourceLocation {
                "end": Position {
                  "column": 45,
                  "index": 673,
                  "line": 22,
                },
                "filename": undefined,
                "identifierName": undefined,
                "start": Position {
                  "column": 2,
                  "index": 630,
                  "line": 22,
                },
              },
              "start": 630,
              "type": "CommentLine",
              "value": " console.log("AUTH_SECRET", AUTH_SECRET);",
            },
          ],
          "end": 817,
          "errors": [],
          "loc": SourceLocation {
            "end": Position {
              "column": 1,
              "index": 817,
              "line": 30,
            },
            "filename": undefined,
            "identifierName": undefined,
            "start": Position {
              "column": 0,
              "index": 0,
              "line": 1,
            },
          },
          "name": null,
          "program": Node {
            "body": [
              Node {
                "assertions": [],
                "end": 54,
                "importKind": "value",
                "loc": SourceLocation {
                  "end": Position {
                    "column": 54,
                    "index": 54,
                    "line": 1,
                  },
                  "filename": undefined,
                  "identifierName": undefined,
                  "start": Position {
                    "column": 0,
                    "index": 0,
                    "line": 1,
                  },
                },
                "source": Node {
                  "end": 53,
                  "extra": {
                    "raw": ""remult"",
                    "rawValue": "remult",
                  },
                  "loc": SourceLocation {
                    "end": Position {
                      "column": 53,
                      "index": 53,
                      "line": 1,
                    },
                    "filename": undefined,
                    "identifierName": undefined,
                    "start": Position {
                      "column": 45,
                      "index": 45,
                      "line": 1,
                    },
                  },
                  "start": 45,
                  "type": "StringLiteral",
                  "value": "remult",
                },
                "specifiers": [
                  Node {
                    "end": 14,
                    "id": null,
                    "importKind": "value",
                    "imported": Node {
                      "end": 14,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 14,
                          "index": 14,
                          "line": 1,
                        },
                        "filename": undefined,
                        "identifierName": "Allow",
                        "start": Position {
                          "column": 9,
                          "index": 9,
                          "line": 1,
                        },
                      },
                      "name": "Allow",
                      "optional": false,
                      "start": 9,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "loc": SourceLocation {
                      "end": Position {
                        "column": 14,
                        "index": 14,
                        "line": 1,
                      },
                      "filename": undefined,
                      "identifierName": undefined,
                      "start": Position {
                        "column": 9,
                        "index": 9,
                        "line": 1,
                      },
                    },
                    "local": Node {
                      "end": 14,
                      "extra": undefined,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 14,
                          "index": 14,
                          "line": 1,
                        },
                        "filename": undefined,
                        "identifierName": "Allow",
                        "start": Position {
                          "column": 9,
                          "index": 9,
                          "line": 1,
                        },
                      },
                      "name": "Allow",
                      "optional": false,
                      "range": undefined,
                      "start": 9,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "name": null,
                    "start": 9,
                    "type": "ImportSpecifier",
                  },
                  Node {
                    "end": 29,
                    "id": null,
                    "importKind": "value",
                    "imported": Node {
                      "end": 29,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 29,
                          "index": 29,
                          "line": 1,
                        },
                        "filename": undefined,
                        "identifierName": "BackendMethod",
                        "start": Position {
                          "column": 16,
                          "index": 16,
                          "line": 1,
                        },
                      },
                      "name": "BackendMethod",
                      "optional": false,
                      "start": 16,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "loc": SourceLocation {
                      "end": Position {
                        "column": 29,
                        "index": 29,
                        "line": 1,
                      },
                      "filename": undefined,
                      "identifierName": undefined,
                      "start": Position {
                        "column": 16,
                        "index": 16,
                        "line": 1,
                      },
                    },
                    "local": Node {
                      "end": 29,
                      "extra": undefined,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 29,
                          "index": 29,
                          "line": 1,
                        },
                        "filename": undefined,
                        "identifierName": "BackendMethod",
                        "start": Position {
                          "column": 16,
                          "index": 16,
                          "line": 1,
                        },
                      },
                      "name": "BackendMethod",
                      "optional": false,
                      "range": undefined,
                      "start": 16,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "name": null,
                    "start": 16,
                    "type": "ImportSpecifier",
                  },
                  Node {
                    "end": 37,
                    "id": null,
                    "importKind": "value",
                    "imported": Node {
                      "end": 37,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 37,
                          "index": 37,
                          "line": 1,
                        },
                        "filename": undefined,
                        "identifierName": "remult",
                        "start": Position {
                          "column": 31,
                          "index": 31,
                          "line": 1,
                        },
                      },
                      "name": "remult",
                      "optional": false,
                      "start": 31,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "loc": SourceLocation {
                      "end": Position {
                        "column": 37,
                        "index": 37,
                        "line": 1,
                      },
                      "filename": undefined,
                      "identifierName": undefined,
                      "start": Position {
                        "column": 31,
                        "index": 31,
                        "line": 1,
                      },
                    },
                    "local": Node {
                      "end": 37,
                      "extra": undefined,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 37,
                          "index": 37,
                          "line": 1,
                        },
                        "filename": undefined,
                        "identifierName": "remult",
                        "start": Position {
                          "column": 31,
                          "index": 31,
                          "line": 1,
                        },
                      },
                      "name": "remult",
                      "optional": false,
                      "range": undefined,
                      "start": 31,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "name": null,
                    "start": 31,
                    "type": "ImportSpecifier",
                  },
                ],
                "start": 0,
                "type": "ImportDeclaration",
              },
              Node {
                "assertions": [],
                "end": 85,
                "importKind": "value",
                "loc": SourceLocation {
                  "end": Position {
                    "column": 30,
                    "index": 85,
                    "line": 2,
                  },
                  "filename": undefined,
                  "identifierName": undefined,
                  "start": Position {
                    "column": 0,
                    "index": 55,
                    "line": 2,
                  },
                },
                "source": Node {
                  "end": 84,
                  "extra": {
                    "raw": ""./task"",
                    "rawValue": "./task",
                  },
                  "loc": SourceLocation {
                    "end": Position {
                      "column": 29,
                      "index": 84,
                      "line": 2,
                    },
                    "filename": undefined,
                    "identifierName": undefined,
                    "start": Position {
                      "column": 21,
                      "index": 76,
                      "line": 2,
                    },
                  },
                  "start": 76,
                  "type": "StringLiteral",
                  "value": "./task",
                },
                "specifiers": [
                  Node {
                    "end": 68,
                    "id": null,
                    "importKind": "value",
                    "imported": Node {
                      "end": 68,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 13,
                          "index": 68,
                          "line": 2,
                        },
                        "filename": undefined,
                        "identifierName": "Task",
                        "start": Position {
                          "column": 9,
                          "index": 64,
                          "line": 2,
                        },
                      },
                      "name": "Task",
                      "optional": false,
                      "start": 64,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "loc": SourceLocation {
                      "end": Position {
                        "column": 13,
                        "index": 68,
                        "line": 2,
                      },
                      "filename": undefined,
                      "identifierName": undefined,
                      "start": Position {
                        "column": 9,
                        "index": 64,
                        "line": 2,
                      },
                    },
                    "local": Node {
                      "end": 68,
                      "extra": undefined,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 13,
                          "index": 68,
                          "line": 2,
                        },
                        "filename": undefined,
                        "identifierName": "Task",
                        "start": Position {
                          "column": 9,
                          "index": 64,
                          "line": 2,
                        },
                      },
                      "name": "Task",
                      "optional": false,
                      "range": undefined,
                      "start": 64,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "name": null,
                    "start": 64,
                    "type": "ImportSpecifier",
                  },
                ],
                "start": 55,
                "type": "ImportDeclaration",
              },
              Node {
                "assertions": [],
                "end": 136,
                "importKind": "value",
                "loc": SourceLocation {
                  "end": Position {
                    "column": 50,
                    "index": 136,
                    "line": 3,
                  },
                  "filename": undefined,
                  "identifierName": undefined,
                  "start": Position {
                    "column": 0,
                    "index": 86,
                    "line": 3,
                  },
                },
                "source": Node {
                  "end": 135,
                  "extra": {
                    "raw": ""$env/static/private"",
                    "rawValue": "$env/static/private",
                  },
                  "loc": SourceLocation {
                    "end": Position {
                      "column": 49,
                      "index": 135,
                      "line": 3,
                    },
                    "filename": undefined,
                    "identifierName": undefined,
                    "start": Position {
                      "column": 28,
                      "index": 114,
                      "line": 3,
                    },
                  },
                  "start": 114,
                  "type": "StringLiteral",
                  "value": "$env/static/private",
                },
                "specifiers": [
                  Node {
                    "end": 106,
                    "id": null,
                    "importKind": "value",
                    "imported": Node {
                      "end": 106,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 20,
                          "index": 106,
                          "line": 3,
                        },
                        "filename": undefined,
                        "identifierName": "AUTH_SECRET",
                        "start": Position {
                          "column": 9,
                          "index": 95,
                          "line": 3,
                        },
                      },
                      "name": "AUTH_SECRET",
                      "optional": false,
                      "start": 95,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "loc": SourceLocation {
                      "end": Position {
                        "column": 20,
                        "index": 106,
                        "line": 3,
                      },
                      "filename": undefined,
                      "identifierName": undefined,
                      "start": Position {
                        "column": 9,
                        "index": 95,
                        "line": 3,
                      },
                    },
                    "local": Node {
                      "end": 106,
                      "extra": undefined,
                      "loc": SourceLocation {
                        "end": Position {
                          "column": 20,
                          "index": 106,
                          "line": 3,
                        },
                        "filename": undefined,
                        "identifierName": "AUTH_SECRET",
                        "start": Position {
                          "column": 9,
                          "index": 95,
                          "line": 3,
                        },
                      },
                      "name": "AUTH_SECRET",
                      "optional": false,
                      "range": undefined,
                      "start": 95,
                      "type": "Identifier",
                      "typeAnnotation": null,
                    },
                    "name": null,
                    "start": 95,
                    "type": "ImportSpecifier",
                  },
                ],
                "start": 86,
                "type": "ImportDeclaration",
              },
              Node {
                "assertions": [],
                "declaration": Node {
                  "body": Node {
                    "body": [
                      Node {
                        "abstract": false,
                        "access": null,
                        "accessibility": null,
                        "async": true,
                        "body": Node {
                          "body": [
                            Node {
                              "declarations": [
                                Node {
                                  "end": 246,
                                  "id": Node {
                                    "end": 226,
                                    "loc": SourceLocation {
                                      "end": Position {
                                        "column": 16,
                                        "index": 226,
                                        "line": 7,
                                      },
                                      "filename": undefined,
                                      "identifierName": "taskRepo",
                                      "start": Position {
                                        "column": 8,
                                        "index": 218,
                                        "line": 7,
                                      },
                                    },
                                    "name": "taskRepo",
                                    "optional": false,
                                    "start": 218,
                                    "type": "Identifier",
                                    "typeAnnotation": null,
                                  },
                                  "init": Node {
                                    "arguments": [
                                      Node {
                                        "end": 245,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 35,
                                            "index": 245,
                                            "line": 7,
                                          },
                                          "filename": undefined,
                                          "identifierName": "Task",
                                          "start": Position {
                                            "column": 31,
                                            "index": 241,
                                            "line": 7,
                                          },
                                        },
                                        "name": "Task",
                                        "optional": false,
                                        "start": 241,
                                        "type": "Identifier",
                                        "typeAnnotation": null,
                                      },
                                    ],
                                    "callee": Node {
                                      "computed": false,
                                      "end": 240,
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 30,
                                          "index": 240,
                                          "line": 7,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 19,
                                          "index": 229,
                                          "line": 7,
                                        },
                                      },
                                      "object": Node {
                                        "end": 235,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 25,
                                            "index": 235,
                                            "line": 7,
                                          },
                                          "filename": undefined,
                                          "identifierName": "remult",
                                          "start": Position {
                                            "column": 19,
                                            "index": 229,
                                            "line": 7,
                                          },
                                        },
                                        "name": "remult",
                                        "optional": false,
                                        "start": 229,
                                        "type": "Identifier",
                                        "typeAnnotation": null,
                                      },
                                      "optional": false,
                                      "property": Node {
                                        "end": 240,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 30,
                                            "index": 240,
                                            "line": 7,
                                          },
                                          "filename": undefined,
                                          "identifierName": "repo",
                                          "start": Position {
                                            "column": 26,
                                            "index": 236,
                                            "line": 7,
                                          },
                                        },
                                        "name": "repo",
                                        "optional": false,
                                        "start": 236,
                                        "type": "Identifier",
                                        "typeAnnotation": null,
                                      },
                                      "start": 229,
                                      "type": "MemberExpression",
                                    },
                                    "end": 246,
                                    "loc": SourceLocation {
                                      "end": Position {
                                        "column": 36,
                                        "index": 246,
                                        "line": 7,
                                      },
                                      "filename": undefined,
                                      "identifierName": undefined,
                                      "start": Position {
                                        "column": 19,
                                        "index": 229,
                                        "line": 7,
                                      },
                                    },
                                    "optional": false,
                                    "start": 229,
                                    "type": "CallExpression",
                                    "typeArguments": null,
                                  },
                                  "loc": SourceLocation {
                                    "end": Position {
                                      "column": 36,
                                      "index": 246,
                                      "line": 7,
                                    },
                                    "filename": undefined,
                                    "identifierName": undefined,
                                    "start": Position {
                                      "column": 8,
                                      "index": 218,
                                      "line": 7,
                                    },
                                  },
                                  "start": 218,
                                  "type": "VariableDeclarator",
                                },
                              ],
                              "end": 247,
                              "kind": "const",
                              "loc": SourceLocation {
                                "end": Position {
                                  "column": 37,
                                  "index": 247,
                                  "line": 7,
                                },
                                "filename": undefined,
                                "identifierName": undefined,
                                "start": Position {
                                  "column": 2,
                                  "index": 212,
                                  "line": 7,
                                },
                              },
                              "start": 212,
                              "type": "VariableDeclaration",
                            },
                          ],
                          "directives": [],
                          "end": 250,
                          "loc": SourceLocation {
                            "end": Position {
                              "column": 2,
                              "index": 250,
                              "line": 8,
                            },
                            "filename": undefined,
                            "identifierName": undefined,
                            "start": Position {
                              "column": 39,
                              "index": 208,
                              "line": 6,
                            },
                          },
                          "start": 208,
                          "type": "BlockStatement",
                        },
                        "computed": false,
                        "decorators": null,
                        "defaults": [],
                        "definite": false,
                        "end": 250,
                        "expression": false,
                        "generator": false,
                        "id": null,
                        "key": Node {
                          "end": 187,
                          "loc": SourceLocation {
                            "end": Position {
                              "column": 18,
                              "index": 187,
                              "line": 6,
                            },
                            "filename": undefined,
                            "identifierName": "yop1",
                            "start": Position {
                              "column": 14,
                              "index": 183,
                              "line": 6,
                            },
                          },
                          "name": "yop1",
                          "optional": false,
                          "start": 183,
                          "type": "Identifier",
                          "typeAnnotation": null,
                        },
                        "kind": "method",
                        "loc": SourceLocation {
                          "end": Position {
                            "column": 2,
                            "index": 250,
                            "line": 8,
                          },
                          "filename": undefined,
                          "identifierName": undefined,
                          "start": Position {
                            "column": 1,
                            "index": 170,
                            "line": 6,
                          },
                        },
                        "optional": false,
                        "override": false,
                        "params": [
                          Node {
                            "end": 206,
                            "loc": SourceLocation {
                              "end": Position {
                                "column": 37,
                                "index": 206,
                                "line": 6,
                              },
                              "filename": undefined,
                              "identifierName": "completed",
                              "start": Position {
                                "column": 19,
                                "index": 188,
                                "line": 6,
                              },
                            },
                            "name": "completed",
                            "optional": false,
                            "start": 188,
                            "type": "Identifier",
                            "typeAnnotation": Node {
                              "end": 206,
                              "loc": SourceLocation {
                                "end": Position {
                                  "column": 37,
                                  "index": 206,
                                  "line": 6,
                                },
                                "filename": undefined,
                                "identifierName": undefined,
                                "start": Position {
                                  "column": 28,
                                  "index": 197,
                                  "line": 6,
                                },
                              },
                              "start": 197,
                              "type": "TSTypeAnnotation",
                              "typeAnnotation": Node {
                                "end": 206,
                                "loc": SourceLocation {
                                  "end": Position {
                                    "column": 37,
                                    "index": 206,
                                    "line": 6,
                                  },
                                  "filename": undefined,
                                  "identifierName": undefined,
                                  "start": Position {
                                    "column": 30,
                                    "index": 199,
                                    "line": 6,
                                  },
                                },
                                "start": 199,
                                "type": "TSBooleanKeyword",
                              },
                            },
                          },
                        ],
                        "predicate": null,
                        "readonly": false,
                        "rest": null,
                        "returnType": null,
                        "start": 170,
                        "static": true,
                        "type": "ClassMethod",
                        "typeParameters": null,
                      },
                      Node {
                        "abstract": false,
                        "access": null,
                        "accessibility": null,
                        "async": true,
                        "body": Node {
                          "body": [
                            {
                              "alternate": null,
                              "consequent": {
                                "body": [
                                  Node {
                                    "end": 396,
                                    "expression": Node {
                                      "arguments": [
                                        Node {
                                          "end": 381,
                                          "extra": {
                                            "raw": ""AUTH_SECRET"",
                                            "rawValue": "AUTH_SECRET",
                                          },
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 27,
                                              "index": 381,
                                              "line": 12,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 14,
                                              "index": 368,
                                              "line": 12,
                                            },
                                          },
                                          "start": 368,
                                          "type": "StringLiteral",
                                          "value": "AUTH_SECRET",
                                        },
                                        Node {
                                          "end": 394,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 40,
                                              "index": 394,
                                              "line": 12,
                                            },
                                            "filename": undefined,
                                            "identifierName": "AUTH_SECRET",
                                            "start": Position {
                                              "column": 29,
                                              "index": 383,
                                              "line": 12,
                                            },
                                          },
                                          "name": "AUTH_SECRET",
                                          "optional": false,
                                          "start": 383,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                      ],
                                      "callee": Node {
                                        "computed": false,
                                        "end": 367,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 13,
                                            "index": 367,
                                            "line": 12,
                                          },
                                          "filename": undefined,
                                          "identifierName": undefined,
                                          "start": Position {
                                            "column": 2,
                                            "index": 356,
                                            "line": 12,
                                          },
                                        },
                                        "object": Node {
                                          "end": 363,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 9,
                                              "index": 363,
                                              "line": 12,
                                            },
                                            "filename": undefined,
                                            "identifierName": "console",
                                            "start": Position {
                                              "column": 2,
                                              "index": 356,
                                              "line": 12,
                                            },
                                          },
                                          "name": "console",
                                          "optional": false,
                                          "start": 356,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                        "optional": false,
                                        "property": Node {
                                          "end": 367,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 13,
                                              "index": 367,
                                              "line": 12,
                                            },
                                            "filename": undefined,
                                            "identifierName": "log",
                                            "start": Position {
                                              "column": 10,
                                              "index": 364,
                                              "line": 12,
                                            },
                                          },
                                          "name": "log",
                                          "optional": false,
                                          "start": 364,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                        "start": 356,
                                        "type": "MemberExpression",
                                      },
                                      "end": 395,
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 41,
                                          "index": 395,
                                          "line": 12,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 2,
                                          "index": 356,
                                          "line": 12,
                                        },
                                      },
                                      "optional": false,
                                      "start": 356,
                                      "type": "CallExpression",
                                      "typeArguments": null,
                                    },
                                    "loc": SourceLocation {
                                      "end": Position {
                                        "column": 42,
                                        "index": 396,
                                        "line": 12,
                                      },
                                      "filename": undefined,
                                      "identifierName": undefined,
                                      "start": Position {
                                        "column": 2,
                                        "index": 356,
                                        "line": 12,
                                      },
                                    },
                                    "start": 356,
                                    "type": "ExpressionStatement",
                                  },
                                  Node {
                                    "declarations": [
                                      Node {
                                        "end": 434,
                                        "id": Node {
                                          "end": 414,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 16,
                                              "index": 414,
                                              "line": 14,
                                            },
                                            "filename": undefined,
                                            "identifierName": "taskRepo",
                                            "start": Position {
                                              "column": 8,
                                              "index": 406,
                                              "line": 14,
                                            },
                                          },
                                          "name": "taskRepo",
                                          "optional": false,
                                          "start": 406,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                        "init": Node {
                                          "arguments": [
                                            Node {
                                              "end": 433,
                                              "loc": SourceLocation {
                                                "end": Position {
                                                  "column": 35,
                                                  "index": 433,
                                                  "line": 14,
                                                },
                                                "filename": undefined,
                                                "identifierName": "Task",
                                                "start": Position {
                                                  "column": 31,
                                                  "index": 429,
                                                  "line": 14,
                                                },
                                              },
                                              "name": "Task",
                                              "optional": false,
                                              "start": 429,
                                              "type": "Identifier",
                                              "typeAnnotation": null,
                                            },
                                          ],
                                          "callee": Node {
                                            "computed": false,
                                            "end": 428,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 30,
                                                "index": 428,
                                                "line": 14,
                                              },
                                              "filename": undefined,
                                              "identifierName": undefined,
                                              "start": Position {
                                                "column": 19,
                                                "index": 417,
                                                "line": 14,
                                              },
                                            },
                                            "object": Node {
                                              "end": 423,
                                              "loc": SourceLocation {
                                                "end": Position {
                                                  "column": 25,
                                                  "index": 423,
                                                  "line": 14,
                                                },
                                                "filename": undefined,
                                                "identifierName": "remult",
                                                "start": Position {
                                                  "column": 19,
                                                  "index": 417,
                                                  "line": 14,
                                                },
                                              },
                                              "name": "remult",
                                              "optional": false,
                                              "start": 417,
                                              "type": "Identifier",
                                              "typeAnnotation": null,
                                            },
                                            "optional": false,
                                            "property": Node {
                                              "end": 428,
                                              "loc": SourceLocation {
                                                "end": Position {
                                                  "column": 30,
                                                  "index": 428,
                                                  "line": 14,
                                                },
                                                "filename": undefined,
                                                "identifierName": "repo",
                                                "start": Position {
                                                  "column": 26,
                                                  "index": 424,
                                                  "line": 14,
                                                },
                                              },
                                              "name": "repo",
                                              "optional": false,
                                              "start": 424,
                                              "type": "Identifier",
                                              "typeAnnotation": null,
                                            },
                                            "start": 417,
                                            "type": "MemberExpression",
                                          },
                                          "end": 434,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 36,
                                              "index": 434,
                                              "line": 14,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 19,
                                              "index": 417,
                                              "line": 14,
                                            },
                                          },
                                          "optional": false,
                                          "start": 417,
                                          "type": "CallExpression",
                                          "typeArguments": null,
                                        },
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 36,
                                            "index": 434,
                                            "line": 14,
                                          },
                                          "filename": undefined,
                                          "identifierName": undefined,
                                          "start": Position {
                                            "column": 8,
                                            "index": 406,
                                            "line": 14,
                                          },
                                        },
                                        "start": 406,
                                        "type": "VariableDeclarator",
                                      },
                                    ],
                                    "end": 435,
                                    "kind": "const",
                                    "loc": SourceLocation {
                                      "end": Position {
                                        "column": 37,
                                        "index": 435,
                                        "line": 14,
                                      },
                                      "filename": undefined,
                                      "identifierName": undefined,
                                      "start": Position {
                                        "column": 2,
                                        "index": 400,
                                        "line": 14,
                                      },
                                    },
                                    "start": 400,
                                    "type": "VariableDeclaration",
                                  },
                                  Node {
                                    "await": false,
                                    "body": Node {
                                      "body": [
                                        Node {
                                          "end": 529,
                                          "expression": Node {
                                            "all": false,
                                            "argument": Node {
                                              "arguments": [
                                                Node {
                                                  "end": 527,
                                                  "loc": SourceLocation {
                                                    "end": Position {
                                                      "column": 45,
                                                      "index": 527,
                                                      "line": 16,
                                                    },
                                                    "filename": undefined,
                                                    "identifierName": undefined,
                                                    "start": Position {
                                                      "column": 23,
                                                      "index": 505,
                                                      "line": 16,
                                                    },
                                                  },
                                                  "properties": [
                                                    Node {
                                                      "argument": Node {
                                                        "end": 514,
                                                        "loc": SourceLocation {
                                                          "end": Position {
                                                            "column": 32,
                                                            "index": 514,
                                                            "line": 16,
                                                          },
                                                          "filename": undefined,
                                                          "identifierName": "task",
                                                          "start": Position {
                                                            "column": 28,
                                                            "index": 510,
                                                            "line": 16,
                                                          },
                                                        },
                                                        "name": "task",
                                                        "optional": false,
                                                        "start": 510,
                                                        "type": "Identifier",
                                                        "typeAnnotation": null,
                                                      },
                                                      "end": 514,
                                                      "loc": SourceLocation {
                                                        "end": Position {
                                                          "column": 32,
                                                          "index": 514,
                                                          "line": 16,
                                                        },
                                                        "filename": undefined,
                                                        "identifierName": undefined,
                                                        "start": Position {
                                                          "column": 25,
                                                          "index": 507,
                                                          "line": 16,
                                                        },
                                                      },
                                                      "start": 507,
                                                      "type": "SpreadElement",
                                                    },
                                                    Node {
                                                      "accessibility": null,
                                                      "computed": false,
                                                      "end": 525,
                                                      "extra": {
                                                        "shorthand": true,
                                                      },
                                                      "key": Node {
                                                        "end": 525,
                                                        "loc": SourceLocation {
                                                          "end": Position {
                                                            "column": 43,
                                                            "index": 525,
                                                            "line": 16,
                                                          },
                                                          "filename": undefined,
                                                          "identifierName": "completed",
                                                          "start": Position {
                                                            "column": 34,
                                                            "index": 516,
                                                            "line": 16,
                                                          },
                                                        },
                                                        "name": "completed",
                                                        "optional": false,
                                                        "start": 516,
                                                        "type": "Identifier",
                                                        "typeAnnotation": null,
                                                      },
                                                      "loc": SourceLocation {
                                                        "end": Position {
                                                          "column": 43,
                                                          "index": 525,
                                                          "line": 16,
                                                        },
                                                        "filename": undefined,
                                                        "identifierName": undefined,
                                                        "start": Position {
                                                          "column": 34,
                                                          "index": 516,
                                                          "line": 16,
                                                        },
                                                      },
                                                      "method": false,
                                                      "shorthand": true,
                                                      "start": 516,
                                                      "type": "ObjectProperty",
                                                      "value": Node {
                                                        "end": 525,
                                                        "extra": undefined,
                                                        "loc": SourceLocation {
                                                          "end": Position {
                                                            "column": 43,
                                                            "index": 525,
                                                            "line": 16,
                                                          },
                                                          "filename": undefined,
                                                          "identifierName": "completed",
                                                          "start": Position {
                                                            "column": 34,
                                                            "index": 516,
                                                            "line": 16,
                                                          },
                                                        },
                                                        "name": "completed",
                                                        "optional": false,
                                                        "range": undefined,
                                                        "start": 516,
                                                        "type": "Identifier",
                                                        "typeAnnotation": null,
                                                      },
                                                    },
                                                  ],
                                                  "start": 505,
                                                  "type": "ObjectExpression",
                                                },
                                              ],
                                              "callee": Node {
                                                "computed": false,
                                                "end": 504,
                                                "loc": SourceLocation {
                                                  "end": Position {
                                                    "column": 22,
                                                    "index": 504,
                                                    "line": 16,
                                                  },
                                                  "filename": undefined,
                                                  "identifierName": undefined,
                                                  "start": Position {
                                                    "column": 9,
                                                    "index": 491,
                                                    "line": 16,
                                                  },
                                                },
                                                "object": Node {
                                                  "end": 499,
                                                  "loc": SourceLocation {
                                                    "end": Position {
                                                      "column": 17,
                                                      "index": 499,
                                                      "line": 16,
                                                    },
                                                    "filename": undefined,
                                                    "identifierName": "taskRepo",
                                                    "start": Position {
                                                      "column": 9,
                                                      "index": 491,
                                                      "line": 16,
                                                    },
                                                  },
                                                  "name": "taskRepo",
                                                  "optional": false,
                                                  "start": 491,
                                                  "type": "Identifier",
                                                  "typeAnnotation": null,
                                                },
                                                "optional": false,
                                                "property": Node {
                                                  "end": 504,
                                                  "loc": SourceLocation {
                                                    "end": Position {
                                                      "column": 22,
                                                      "index": 504,
                                                      "line": 16,
                                                    },
                                                    "filename": undefined,
                                                    "identifierName": "save",
                                                    "start": Position {
                                                      "column": 18,
                                                      "index": 500,
                                                      "line": 16,
                                                    },
                                                  },
                                                  "name": "save",
                                                  "optional": false,
                                                  "start": 500,
                                                  "type": "Identifier",
                                                  "typeAnnotation": null,
                                                },
                                                "start": 491,
                                                "type": "MemberExpression",
                                              },
                                              "end": 528,
                                              "loc": SourceLocation {
                                                "end": Position {
                                                  "column": 46,
                                                  "index": 528,
                                                  "line": 16,
                                                },
                                                "filename": undefined,
                                                "identifierName": undefined,
                                                "start": Position {
                                                  "column": 9,
                                                  "index": 491,
                                                  "line": 16,
                                                },
                                              },
                                              "optional": false,
                                              "start": 491,
                                              "type": "CallExpression",
                                              "typeArguments": null,
                                            },
                                            "end": 528,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 46,
                                                "index": 528,
                                                "line": 16,
                                              },
                                              "filename": undefined,
                                              "identifierName": undefined,
                                              "start": Position {
                                                "column": 3,
                                                "index": 485,
                                                "line": 16,
                                              },
                                            },
                                            "start": 485,
                                            "type": "AwaitExpression",
                                          },
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 47,
                                              "index": 529,
                                              "line": 16,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 3,
                                              "index": 485,
                                              "line": 16,
                                            },
                                          },
                                          "start": 485,
                                          "type": "ExpressionStatement",
                                        },
                                      ],
                                      "directives": [],
                                      "end": 533,
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 3,
                                          "index": 533,
                                          "line": 17,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 44,
                                          "index": 480,
                                          "line": 15,
                                        },
                                      },
                                      "start": 480,
                                      "type": "BlockStatement",
                                    },
                                    "end": 533,
                                    "left": Node {
                                      "declarations": [
                                        Node {
                                          "end": 453,
                                          "id": Node {
                                            "end": 453,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 17,
                                                "index": 453,
                                                "line": 15,
                                              },
                                              "filename": undefined,
                                              "identifierName": "task",
                                              "start": Position {
                                                "column": 13,
                                                "index": 449,
                                                "line": 15,
                                              },
                                            },
                                            "name": "task",
                                            "optional": false,
                                            "start": 449,
                                            "type": "Identifier",
                                            "typeAnnotation": null,
                                          },
                                          "init": null,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 17,
                                              "index": 453,
                                              "line": 15,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 13,
                                              "index": 449,
                                              "line": 15,
                                            },
                                          },
                                          "start": 449,
                                          "type": "VariableDeclarator",
                                        },
                                      ],
                                      "end": 453,
                                      "kind": "const",
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 17,
                                          "index": 453,
                                          "line": 15,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 7,
                                          "index": 443,
                                          "line": 15,
                                        },
                                      },
                                      "start": 443,
                                      "type": "VariableDeclaration",
                                    },
                                    "loc": SourceLocation {
                                      "end": Position {
                                        "column": 3,
                                        "index": 533,
                                        "line": 17,
                                      },
                                      "filename": undefined,
                                      "identifierName": undefined,
                                      "start": Position {
                                        "column": 2,
                                        "index": 438,
                                        "line": 15,
                                      },
                                    },
                                    "right": Node {
                                      "all": false,
                                      "argument": Node {
                                        "arguments": [],
                                        "callee": Node {
                                          "computed": false,
                                          "end": 476,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 40,
                                              "index": 476,
                                              "line": 15,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 27,
                                              "index": 463,
                                              "line": 15,
                                            },
                                          },
                                          "object": Node {
                                            "end": 471,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 35,
                                                "index": 471,
                                                "line": 15,
                                              },
                                              "filename": undefined,
                                              "identifierName": "taskRepo",
                                              "start": Position {
                                                "column": 27,
                                                "index": 463,
                                                "line": 15,
                                              },
                                            },
                                            "name": "taskRepo",
                                            "optional": false,
                                            "start": 463,
                                            "type": "Identifier",
                                            "typeAnnotation": null,
                                          },
                                          "optional": false,
                                          "property": Node {
                                            "end": 476,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 40,
                                                "index": 476,
                                                "line": 15,
                                              },
                                              "filename": undefined,
                                              "identifierName": "find",
                                              "start": Position {
                                                "column": 36,
                                                "index": 472,
                                                "line": 15,
                                              },
                                            },
                                            "name": "find",
                                            "optional": false,
                                            "start": 472,
                                            "type": "Identifier",
                                            "typeAnnotation": null,
                                          },
                                          "start": 463,
                                          "type": "MemberExpression",
                                        },
                                        "end": 478,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 42,
                                            "index": 478,
                                            "line": 15,
                                          },
                                          "filename": undefined,
                                          "identifierName": undefined,
                                          "start": Position {
                                            "column": 27,
                                            "index": 463,
                                            "line": 15,
                                          },
                                        },
                                        "optional": false,
                                        "start": 463,
                                        "type": "CallExpression",
                                        "typeArguments": null,
                                      },
                                      "end": 478,
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 42,
                                          "index": 478,
                                          "line": 15,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 21,
                                          "index": 457,
                                          "line": 15,
                                        },
                                      },
                                      "start": 457,
                                      "type": "AwaitExpression",
                                    },
                                    "start": 438,
                                    "type": "ForOfStatement",
                                  },
                                ],
                                "directives": [],
                                "type": "BlockStatement",
                              },
                              "test": {
                                "computed": false,
                                "object": {
                                  "computed": false,
                                  "object": {
                                    "meta": {
                                      "name": "import",
                                      "optional": false,
                                      "type": "Identifier",
                                      "typeAnnotation": null,
                                    },
                                    "property": {
                                      "name": "meta",
                                      "optional": false,
                                      "type": "Identifier",
                                      "typeAnnotation": null,
                                    },
                                    "type": "MetaProperty",
                                  },
                                  "optional": false,
                                  "property": {
                                    "name": "env",
                                    "optional": false,
                                    "type": "Identifier",
                                    "typeAnnotation": null,
                                  },
                                  "type": "MemberExpression",
                                },
                                "optional": false,
                                "property": {
                                  "name": "SSR",
                                  "optional": false,
                                  "type": "Identifier",
                                  "typeAnnotation": null,
                                },
                                "type": "MemberExpression",
                              },
                              "type": "IfStatement",
                            },
                          ],
                          "directives": [],
                          "end": 536,
                          "loc": SourceLocation {
                            "end": Position {
                              "column": 2,
                              "index": 536,
                              "line": 18,
                            },
                            "filename": undefined,
                            "identifierName": undefined,
                            "start": Position {
                              "column": 50,
                              "index": 352,
                              "line": 11,
                            },
                          },
                          "start": 352,
                          "type": "BlockStatement",
                        },
                        "computed": false,
                        "decorators": [
                          Node {
                            "end": 301,
                            "expression": Node {
                              "arguments": [
                                Node {
                                  "end": 300,
                                  "loc": SourceLocation {
                                    "end": Position {
                                      "column": 48,
                                      "index": 300,
                                      "line": 10,
                                    },
                                    "filename": undefined,
                                    "identifierName": undefined,
                                    "start": Position {
                                      "column": 16,
                                      "index": 268,
                                      "line": 10,
                                    },
                                  },
                                  "properties": [
                                    Node {
                                      "accessibility": null,
                                      "computed": false,
                                      "end": 298,
                                      "key": Node {
                                        "end": 277,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 25,
                                            "index": 277,
                                            "line": 10,
                                          },
                                          "filename": undefined,
                                          "identifierName": "allowed",
                                          "start": Position {
                                            "column": 18,
                                            "index": 270,
                                            "line": 10,
                                          },
                                        },
                                        "name": "allowed",
                                        "optional": false,
                                        "start": 270,
                                        "type": "Identifier",
                                        "typeAnnotation": null,
                                      },
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 46,
                                          "index": 298,
                                          "line": 10,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 18,
                                          "index": 270,
                                          "line": 10,
                                        },
                                      },
                                      "method": false,
                                      "shorthand": false,
                                      "start": 270,
                                      "type": "ObjectProperty",
                                      "value": Node {
                                        "computed": false,
                                        "end": 298,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 46,
                                            "index": 298,
                                            "line": 10,
                                          },
                                          "filename": undefined,
                                          "identifierName": undefined,
                                          "start": Position {
                                            "column": 27,
                                            "index": 279,
                                            "line": 10,
                                          },
                                        },
                                        "object": Node {
                                          "end": 284,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 32,
                                              "index": 284,
                                              "line": 10,
                                            },
                                            "filename": undefined,
                                            "identifierName": "Allow",
                                            "start": Position {
                                              "column": 27,
                                              "index": 279,
                                              "line": 10,
                                            },
                                          },
                                          "name": "Allow",
                                          "optional": false,
                                          "start": 279,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                        "optional": false,
                                        "property": Node {
                                          "end": 298,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 46,
                                              "index": 298,
                                              "line": 10,
                                            },
                                            "filename": undefined,
                                            "identifierName": "authenticated",
                                            "start": Position {
                                              "column": 33,
                                              "index": 285,
                                              "line": 10,
                                            },
                                          },
                                          "name": "authenticated",
                                          "optional": false,
                                          "start": 285,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                        "start": 279,
                                        "type": "MemberExpression",
                                      },
                                    },
                                  ],
                                  "start": 268,
                                  "type": "ObjectExpression",
                                },
                              ],
                              "callee": Node {
                                "end": 267,
                                "loc": SourceLocation {
                                  "end": Position {
                                    "column": 15,
                                    "index": 267,
                                    "line": 10,
                                  },
                                  "filename": undefined,
                                  "identifierName": "BackendMethod",
                                  "start": Position {
                                    "column": 2,
                                    "index": 254,
                                    "line": 10,
                                  },
                                },
                                "name": "BackendMethod",
                                "optional": false,
                                "start": 254,
                                "type": "Identifier",
                                "typeAnnotation": null,
                              },
                              "end": 301,
                              "loc": SourceLocation {
                                "end": Position {
                                  "column": 49,
                                  "index": 301,
                                  "line": 10,
                                },
                                "filename": undefined,
                                "identifierName": undefined,
                                "start": Position {
                                  "column": 2,
                                  "index": 254,
                                  "line": 10,
                                },
                              },
                              "optional": false,
                              "start": 254,
                              "type": "CallExpression",
                              "typeArguments": null,
                            },
                            "loc": SourceLocation {
                              "end": Position {
                                "column": 49,
                                "index": 301,
                                "line": 10,
                              },
                              "filename": undefined,
                              "identifierName": undefined,
                              "start": Position {
                                "column": 1,
                                "index": 253,
                                "line": 10,
                              },
                            },
                            "start": 253,
                            "type": "Decorator",
                          },
                        ],
                        "defaults": [],
                        "definite": false,
                        "end": 536,
                        "expression": false,
                        "generator": false,
                        "id": null,
                        "key": Node {
                          "end": 331,
                          "loc": SourceLocation {
                            "end": Position {
                              "column": 29,
                              "index": 331,
                              "line": 11,
                            },
                            "filename": undefined,
                            "identifierName": "setAllCompleted",
                            "start": Position {
                              "column": 14,
                              "index": 316,
                              "line": 11,
                            },
                          },
                          "name": "setAllCompleted",
                          "optional": false,
                          "start": 316,
                          "type": "Identifier",
                          "typeAnnotation": null,
                        },
                        "kind": "method",
                        "loc": SourceLocation {
                          "end": Position {
                            "column": 2,
                            "index": 536,
                            "line": 18,
                          },
                          "filename": undefined,
                          "identifierName": undefined,
                          "start": Position {
                            "column": 1,
                            "index": 253,
                            "line": 10,
                          },
                        },
                        "optional": false,
                        "override": false,
                        "params": [
                          Node {
                            "end": 350,
                            "loc": SourceLocation {
                              "end": Position {
                                "column": 48,
                                "index": 350,
                                "line": 11,
                              },
                              "filename": undefined,
                              "identifierName": "completed",
                              "start": Position {
                                "column": 30,
                                "index": 332,
                                "line": 11,
                              },
                            },
                            "name": "completed",
                            "optional": false,
                            "start": 332,
                            "type": "Identifier",
                            "typeAnnotation": Node {
                              "end": 350,
                              "loc": SourceLocation {
                                "end": Position {
                                  "column": 48,
                                  "index": 350,
                                  "line": 11,
                                },
                                "filename": undefined,
                                "identifierName": undefined,
                                "start": Position {
                                  "column": 39,
                                  "index": 341,
                                  "line": 11,
                                },
                              },
                              "start": 341,
                              "type": "TSTypeAnnotation",
                              "typeAnnotation": Node {
                                "end": 350,
                                "loc": SourceLocation {
                                  "end": Position {
                                    "column": 48,
                                    "index": 350,
                                    "line": 11,
                                  },
                                  "filename": undefined,
                                  "identifierName": undefined,
                                  "start": Position {
                                    "column": 41,
                                    "index": 343,
                                    "line": 11,
                                  },
                                },
                                "start": 343,
                                "type": "TSBooleanKeyword",
                              },
                            },
                          },
                        ],
                        "predicate": null,
                        "readonly": false,
                        "rest": null,
                        "returnType": null,
                        "start": 253,
                        "static": true,
                        "type": "ClassMethod",
                        "typeParameters": null,
                      },
                      Node {
                        "abstract": false,
                        "access": null,
                        "accessibility": null,
                        "async": true,
                        "body": Node {
                          "body": [
                            {
                              "alternate": null,
                              "consequent": {
                                "body": [
                                  Node {
                                    "declarations": [
                                      Node {
                                        "end": 711,
                                        "id": Node {
                                          "end": 691,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 16,
                                              "index": 691,
                                              "line": 24,
                                            },
                                            "filename": undefined,
                                            "identifierName": "taskRepo",
                                            "start": Position {
                                              "column": 8,
                                              "index": 683,
                                              "line": 24,
                                            },
                                          },
                                          "name": "taskRepo",
                                          "optional": false,
                                          "start": 683,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                        "init": Node {
                                          "arguments": [
                                            Node {
                                              "end": 710,
                                              "loc": SourceLocation {
                                                "end": Position {
                                                  "column": 35,
                                                  "index": 710,
                                                  "line": 24,
                                                },
                                                "filename": undefined,
                                                "identifierName": "Task",
                                                "start": Position {
                                                  "column": 31,
                                                  "index": 706,
                                                  "line": 24,
                                                },
                                              },
                                              "name": "Task",
                                              "optional": false,
                                              "start": 706,
                                              "type": "Identifier",
                                              "typeAnnotation": null,
                                            },
                                          ],
                                          "callee": Node {
                                            "computed": false,
                                            "end": 705,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 30,
                                                "index": 705,
                                                "line": 24,
                                              },
                                              "filename": undefined,
                                              "identifierName": undefined,
                                              "start": Position {
                                                "column": 19,
                                                "index": 694,
                                                "line": 24,
                                              },
                                            },
                                            "object": Node {
                                              "end": 700,
                                              "loc": SourceLocation {
                                                "end": Position {
                                                  "column": 25,
                                                  "index": 700,
                                                  "line": 24,
                                                },
                                                "filename": undefined,
                                                "identifierName": "remult",
                                                "start": Position {
                                                  "column": 19,
                                                  "index": 694,
                                                  "line": 24,
                                                },
                                              },
                                              "name": "remult",
                                              "optional": false,
                                              "start": 694,
                                              "type": "Identifier",
                                              "typeAnnotation": null,
                                            },
                                            "optional": false,
                                            "property": Node {
                                              "end": 705,
                                              "loc": SourceLocation {
                                                "end": Position {
                                                  "column": 30,
                                                  "index": 705,
                                                  "line": 24,
                                                },
                                                "filename": undefined,
                                                "identifierName": "repo",
                                                "start": Position {
                                                  "column": 26,
                                                  "index": 701,
                                                  "line": 24,
                                                },
                                              },
                                              "name": "repo",
                                              "optional": false,
                                              "start": 701,
                                              "type": "Identifier",
                                              "typeAnnotation": null,
                                            },
                                            "start": 694,
                                            "type": "MemberExpression",
                                          },
                                          "end": 711,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 36,
                                              "index": 711,
                                              "line": 24,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 19,
                                              "index": 694,
                                              "line": 24,
                                            },
                                          },
                                          "optional": false,
                                          "start": 694,
                                          "type": "CallExpression",
                                          "typeArguments": null,
                                        },
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 36,
                                            "index": 711,
                                            "line": 24,
                                          },
                                          "filename": undefined,
                                          "identifierName": undefined,
                                          "start": Position {
                                            "column": 8,
                                            "index": 683,
                                            "line": 24,
                                          },
                                        },
                                        "start": 683,
                                        "type": "VariableDeclarator",
                                      },
                                    ],
                                    "end": 712,
                                    "kind": "const",
                                    "leadingComments": [
                                      {
                                        "end": 673,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 45,
                                            "index": 673,
                                            "line": 22,
                                          },
                                          "filename": undefined,
                                          "identifierName": undefined,
                                          "start": Position {
                                            "column": 2,
                                            "index": 630,
                                            "line": 22,
                                          },
                                        },
                                        "start": 630,
                                        "type": "CommentLine",
                                        "value": " console.log("AUTH_SECRET", AUTH_SECRET);",
                                      },
                                    ],
                                    "loc": SourceLocation {
                                      "end": Position {
                                        "column": 37,
                                        "index": 712,
                                        "line": 24,
                                      },
                                      "filename": undefined,
                                      "identifierName": undefined,
                                      "start": Position {
                                        "column": 2,
                                        "index": 677,
                                        "line": 24,
                                      },
                                    },
                                    "start": 677,
                                    "type": "VariableDeclaration",
                                  },
                                  Node {
                                    "await": false,
                                    "body": Node {
                                      "body": [
                                        Node {
                                          "end": 806,
                                          "expression": Node {
                                            "all": false,
                                            "argument": Node {
                                              "arguments": [
                                                Node {
                                                  "end": 804,
                                                  "loc": SourceLocation {
                                                    "end": Position {
                                                      "column": 45,
                                                      "index": 804,
                                                      "line": 26,
                                                    },
                                                    "filename": undefined,
                                                    "identifierName": undefined,
                                                    "start": Position {
                                                      "column": 23,
                                                      "index": 782,
                                                      "line": 26,
                                                    },
                                                  },
                                                  "properties": [
                                                    Node {
                                                      "argument": Node {
                                                        "end": 791,
                                                        "loc": SourceLocation {
                                                          "end": Position {
                                                            "column": 32,
                                                            "index": 791,
                                                            "line": 26,
                                                          },
                                                          "filename": undefined,
                                                          "identifierName": "task",
                                                          "start": Position {
                                                            "column": 28,
                                                            "index": 787,
                                                            "line": 26,
                                                          },
                                                        },
                                                        "name": "task",
                                                        "optional": false,
                                                        "start": 787,
                                                        "type": "Identifier",
                                                        "typeAnnotation": null,
                                                      },
                                                      "end": 791,
                                                      "loc": SourceLocation {
                                                        "end": Position {
                                                          "column": 32,
                                                          "index": 791,
                                                          "line": 26,
                                                        },
                                                        "filename": undefined,
                                                        "identifierName": undefined,
                                                        "start": Position {
                                                          "column": 25,
                                                          "index": 784,
                                                          "line": 26,
                                                        },
                                                      },
                                                      "start": 784,
                                                      "type": "SpreadElement",
                                                    },
                                                    Node {
                                                      "accessibility": null,
                                                      "computed": false,
                                                      "end": 802,
                                                      "extra": {
                                                        "shorthand": true,
                                                      },
                                                      "key": Node {
                                                        "end": 802,
                                                        "loc": SourceLocation {
                                                          "end": Position {
                                                            "column": 43,
                                                            "index": 802,
                                                            "line": 26,
                                                          },
                                                          "filename": undefined,
                                                          "identifierName": "completed",
                                                          "start": Position {
                                                            "column": 34,
                                                            "index": 793,
                                                            "line": 26,
                                                          },
                                                        },
                                                        "name": "completed",
                                                        "optional": false,
                                                        "start": 793,
                                                        "type": "Identifier",
                                                        "typeAnnotation": null,
                                                      },
                                                      "loc": SourceLocation {
                                                        "end": Position {
                                                          "column": 43,
                                                          "index": 802,
                                                          "line": 26,
                                                        },
                                                        "filename": undefined,
                                                        "identifierName": undefined,
                                                        "start": Position {
                                                          "column": 34,
                                                          "index": 793,
                                                          "line": 26,
                                                        },
                                                      },
                                                      "method": false,
                                                      "shorthand": true,
                                                      "start": 793,
                                                      "type": "ObjectProperty",
                                                      "value": Node {
                                                        "end": 802,
                                                        "extra": undefined,
                                                        "loc": SourceLocation {
                                                          "end": Position {
                                                            "column": 43,
                                                            "index": 802,
                                                            "line": 26,
                                                          },
                                                          "filename": undefined,
                                                          "identifierName": "completed",
                                                          "start": Position {
                                                            "column": 34,
                                                            "index": 793,
                                                            "line": 26,
                                                          },
                                                        },
                                                        "name": "completed",
                                                        "optional": false,
                                                        "range": undefined,
                                                        "start": 793,
                                                        "type": "Identifier",
                                                        "typeAnnotation": null,
                                                      },
                                                    },
                                                  ],
                                                  "start": 782,
                                                  "type": "ObjectExpression",
                                                },
                                              ],
                                              "callee": Node {
                                                "computed": false,
                                                "end": 781,
                                                "loc": SourceLocation {
                                                  "end": Position {
                                                    "column": 22,
                                                    "index": 781,
                                                    "line": 26,
                                                  },
                                                  "filename": undefined,
                                                  "identifierName": undefined,
                                                  "start": Position {
                                                    "column": 9,
                                                    "index": 768,
                                                    "line": 26,
                                                  },
                                                },
                                                "object": Node {
                                                  "end": 776,
                                                  "loc": SourceLocation {
                                                    "end": Position {
                                                      "column": 17,
                                                      "index": 776,
                                                      "line": 26,
                                                    },
                                                    "filename": undefined,
                                                    "identifierName": "taskRepo",
                                                    "start": Position {
                                                      "column": 9,
                                                      "index": 768,
                                                      "line": 26,
                                                    },
                                                  },
                                                  "name": "taskRepo",
                                                  "optional": false,
                                                  "start": 768,
                                                  "type": "Identifier",
                                                  "typeAnnotation": null,
                                                },
                                                "optional": false,
                                                "property": Node {
                                                  "end": 781,
                                                  "loc": SourceLocation {
                                                    "end": Position {
                                                      "column": 22,
                                                      "index": 781,
                                                      "line": 26,
                                                    },
                                                    "filename": undefined,
                                                    "identifierName": "save",
                                                    "start": Position {
                                                      "column": 18,
                                                      "index": 777,
                                                      "line": 26,
                                                    },
                                                  },
                                                  "name": "save",
                                                  "optional": false,
                                                  "start": 777,
                                                  "type": "Identifier",
                                                  "typeAnnotation": null,
                                                },
                                                "start": 768,
                                                "type": "MemberExpression",
                                              },
                                              "end": 805,
                                              "loc": SourceLocation {
                                                "end": Position {
                                                  "column": 46,
                                                  "index": 805,
                                                  "line": 26,
                                                },
                                                "filename": undefined,
                                                "identifierName": undefined,
                                                "start": Position {
                                                  "column": 9,
                                                  "index": 768,
                                                  "line": 26,
                                                },
                                              },
                                              "optional": false,
                                              "start": 768,
                                              "type": "CallExpression",
                                              "typeArguments": null,
                                            },
                                            "end": 805,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 46,
                                                "index": 805,
                                                "line": 26,
                                              },
                                              "filename": undefined,
                                              "identifierName": undefined,
                                              "start": Position {
                                                "column": 3,
                                                "index": 762,
                                                "line": 26,
                                              },
                                            },
                                            "start": 762,
                                            "type": "AwaitExpression",
                                          },
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 47,
                                              "index": 806,
                                              "line": 26,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 3,
                                              "index": 762,
                                              "line": 26,
                                            },
                                          },
                                          "start": 762,
                                          "type": "ExpressionStatement",
                                        },
                                      ],
                                      "directives": [],
                                      "end": 810,
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 3,
                                          "index": 810,
                                          "line": 27,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 44,
                                          "index": 757,
                                          "line": 25,
                                        },
                                      },
                                      "start": 757,
                                      "type": "BlockStatement",
                                    },
                                    "end": 810,
                                    "left": Node {
                                      "declarations": [
                                        Node {
                                          "end": 730,
                                          "id": Node {
                                            "end": 730,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 17,
                                                "index": 730,
                                                "line": 25,
                                              },
                                              "filename": undefined,
                                              "identifierName": "task",
                                              "start": Position {
                                                "column": 13,
                                                "index": 726,
                                                "line": 25,
                                              },
                                            },
                                            "name": "task",
                                            "optional": false,
                                            "start": 726,
                                            "type": "Identifier",
                                            "typeAnnotation": null,
                                          },
                                          "init": null,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 17,
                                              "index": 730,
                                              "line": 25,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 13,
                                              "index": 726,
                                              "line": 25,
                                            },
                                          },
                                          "start": 726,
                                          "type": "VariableDeclarator",
                                        },
                                      ],
                                      "end": 730,
                                      "kind": "const",
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 17,
                                          "index": 730,
                                          "line": 25,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 7,
                                          "index": 720,
                                          "line": 25,
                                        },
                                      },
                                      "start": 720,
                                      "type": "VariableDeclaration",
                                    },
                                    "loc": SourceLocation {
                                      "end": Position {
                                        "column": 3,
                                        "index": 810,
                                        "line": 27,
                                      },
                                      "filename": undefined,
                                      "identifierName": undefined,
                                      "start": Position {
                                        "column": 2,
                                        "index": 715,
                                        "line": 25,
                                      },
                                    },
                                    "right": Node {
                                      "all": false,
                                      "argument": Node {
                                        "arguments": [],
                                        "callee": Node {
                                          "computed": false,
                                          "end": 753,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 40,
                                              "index": 753,
                                              "line": 25,
                                            },
                                            "filename": undefined,
                                            "identifierName": undefined,
                                            "start": Position {
                                              "column": 27,
                                              "index": 740,
                                              "line": 25,
                                            },
                                          },
                                          "object": Node {
                                            "end": 748,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 35,
                                                "index": 748,
                                                "line": 25,
                                              },
                                              "filename": undefined,
                                              "identifierName": "taskRepo",
                                              "start": Position {
                                                "column": 27,
                                                "index": 740,
                                                "line": 25,
                                              },
                                            },
                                            "name": "taskRepo",
                                            "optional": false,
                                            "start": 740,
                                            "type": "Identifier",
                                            "typeAnnotation": null,
                                          },
                                          "optional": false,
                                          "property": Node {
                                            "end": 753,
                                            "loc": SourceLocation {
                                              "end": Position {
                                                "column": 40,
                                                "index": 753,
                                                "line": 25,
                                              },
                                              "filename": undefined,
                                              "identifierName": "find",
                                              "start": Position {
                                                "column": 36,
                                                "index": 749,
                                                "line": 25,
                                              },
                                            },
                                            "name": "find",
                                            "optional": false,
                                            "start": 749,
                                            "type": "Identifier",
                                            "typeAnnotation": null,
                                          },
                                          "start": 740,
                                          "type": "MemberExpression",
                                        },
                                        "end": 755,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 42,
                                            "index": 755,
                                            "line": 25,
                                          },
                                          "filename": undefined,
                                          "identifierName": undefined,
                                          "start": Position {
                                            "column": 27,
                                            "index": 740,
                                            "line": 25,
                                          },
                                        },
                                        "optional": false,
                                        "start": 740,
                                        "type": "CallExpression",
                                        "typeArguments": null,
                                      },
                                      "end": 755,
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 42,
                                          "index": 755,
                                          "line": 25,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 21,
                                          "index": 734,
                                          "line": 25,
                                        },
                                      },
                                      "start": 734,
                                      "type": "AwaitExpression",
                                    },
                                    "start": 715,
                                    "type": "ForOfStatement",
                                  },
                                ],
                                "directives": [],
                                "type": "BlockStatement",
                              },
                              "test": {
                                "computed": false,
                                "object": {
                                  "computed": false,
                                  "object": {
                                    "meta": {
                                      "name": "import",
                                      "optional": false,
                                      "type": "Identifier",
                                      "typeAnnotation": null,
                                    },
                                    "property": {
                                      "name": "meta",
                                      "optional": false,
                                      "type": "Identifier",
                                      "typeAnnotation": null,
                                    },
                                    "type": "MetaProperty",
                                  },
                                  "optional": false,
                                  "property": {
                                    "name": "env",
                                    "optional": false,
                                    "type": "Identifier",
                                    "typeAnnotation": null,
                                  },
                                  "type": "MemberExpression",
                                },
                                "optional": false,
                                "property": {
                                  "name": "SSR",
                                  "optional": false,
                                  "type": "Identifier",
                                  "typeAnnotation": null,
                                },
                                "type": "MemberExpression",
                              },
                              "type": "IfStatement",
                            },
                          ],
                          "directives": [],
                          "end": 813,
                          "loc": SourceLocation {
                            "end": Position {
                              "column": 2,
                              "index": 813,
                              "line": 28,
                            },
                            "filename": undefined,
                            "identifierName": undefined,
                            "start": Position {
                              "column": 38,
                              "index": 626,
                              "line": 21,
                            },
                          },
                          "start": 626,
                          "type": "BlockStatement",
                        },
                        "computed": false,
                        "decorators": [
                          Node {
                            "end": 587,
                            "expression": Node {
                              "arguments": [
                                Node {
                                  "end": 586,
                                  "loc": SourceLocation {
                                    "end": Position {
                                      "column": 48,
                                      "index": 586,
                                      "line": 20,
                                    },
                                    "filename": undefined,
                                    "identifierName": undefined,
                                    "start": Position {
                                      "column": 16,
                                      "index": 554,
                                      "line": 20,
                                    },
                                  },
                                  "properties": [
                                    Node {
                                      "accessibility": null,
                                      "computed": false,
                                      "end": 584,
                                      "key": Node {
                                        "end": 563,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 25,
                                            "index": 563,
                                            "line": 20,
                                          },
                                          "filename": undefined,
                                          "identifierName": "allowed",
                                          "start": Position {
                                            "column": 18,
                                            "index": 556,
                                            "line": 20,
                                          },
                                        },
                                        "name": "allowed",
                                        "optional": false,
                                        "start": 556,
                                        "type": "Identifier",
                                        "typeAnnotation": null,
                                      },
                                      "loc": SourceLocation {
                                        "end": Position {
                                          "column": 46,
                                          "index": 584,
                                          "line": 20,
                                        },
                                        "filename": undefined,
                                        "identifierName": undefined,
                                        "start": Position {
                                          "column": 18,
                                          "index": 556,
                                          "line": 20,
                                        },
                                      },
                                      "method": false,
                                      "shorthand": false,
                                      "start": 556,
                                      "type": "ObjectProperty",
                                      "value": Node {
                                        "computed": false,
                                        "end": 584,
                                        "loc": SourceLocation {
                                          "end": Position {
                                            "column": 46,
                                            "index": 584,
                                            "line": 20,
                                          },
                                          "filename": undefined,
                                          "identifierName": undefined,
                                          "start": Position {
                                            "column": 27,
                                            "index": 565,
                                            "line": 20,
                                          },
                                        },
                                        "object": Node {
                                          "end": 570,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 32,
                                              "index": 570,
                                              "line": 20,
                                            },
                                            "filename": undefined,
                                            "identifierName": "Allow",
                                            "start": Position {
                                              "column": 27,
                                              "index": 565,
                                              "line": 20,
                                            },
                                          },
                                          "name": "Allow",
                                          "optional": false,
                                          "start": 565,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                        "optional": false,
                                        "property": Node {
                                          "end": 584,
                                          "loc": SourceLocation {
                                            "end": Position {
                                              "column": 46,
                                              "index": 584,
                                              "line": 20,
                                            },
                                            "filename": undefined,
                                            "identifierName": "authenticated",
                                            "start": Position {
                                              "column": 33,
                                              "index": 571,
                                              "line": 20,
                                            },
                                          },
                                          "name": "authenticated",
                                          "optional": false,
                                          "start": 571,
                                          "type": "Identifier",
                                          "typeAnnotation": null,
                                        },
                                        "start": 565,
                                        "type": "MemberExpression",
                                      },
                                    },
                                  ],
                                  "start": 554,
                                  "type": "ObjectExpression",
                                },
                              ],
                              "callee": Node {
                                "end": 553,
                                "loc": SourceLocation {
                                  "end": Position {
                                    "column": 15,
                                    "index": 553,
                                    "line": 20,
                                  },
                                  "filename": undefined,
                                  "identifierName": "BackendMethod",
                                  "start": Position {
                                    "column": 2,
                                    "index": 540,
                                    "line": 20,
                                  },
                                },
                                "name": "BackendMethod",
                                "optional": false,
                                "start": 540,
                                "type": "Identifier",
                                "typeAnnotation": null,
                              },
                              "end": 587,
                              "loc": SourceLocation {
                                "end": Position {
                                  "column": 49,
                                  "index": 587,
                                  "line": 20,
                                },
                                "filename": undefined,
                                "identifierName": undefined,
                                "start": Position {
                                  "column": 2,
                                  "index": 540,
                                  "line": 20,
                                },
                              },
                              "optional": false,
                              "start": 540,
                              "type": "CallExpression",
                              "typeArguments": null,
                            },
                            "loc": SourceLocation {
                              "end": Position {
                                "column": 49,
                                "index": 587,
                                "line": 20,
                              },
                              "filename": undefined,
                              "identifierName": undefined,
                              "start": Position {
                                "column": 1,
                                "index": 539,
                                "line": 20,
                              },
                            },
                            "start": 539,
                            "type": "Decorator",
                          },
                        ],
                        "defaults": [],
                        "definite": false,
                        "end": 813,
                        "expression": false,
                        "generator": false,
                        "id": null,
                        "key": Node {
                          "end": 605,
                          "loc": SourceLocation {
                            "end": Position {
                              "column": 17,
                              "index": 605,
                              "line": 21,
                            },
                            "filename": undefined,
                            "identifierName": "Yop",
                            "start": Position {
                              "column": 14,
                              "index": 602,
                              "line": 21,
                            },
                          },
                          "name": "Yop",
                          "optional": false,
                          "start": 602,
                          "type": "Identifier",
                          "typeAnnotation": null,
                        },
                        "kind": "method",
                        "loc": SourceLocation {
                          "end": Position {
                            "column": 2,
                            "index": 813,
                            "line": 28,
                          },
                          "filename": undefined,
                          "identifierName": undefined,
                          "start": Position {
                            "column": 1,
                            "index": 539,
                            "line": 20,
                          },
                        },
                        "optional": false,
                        "override": false,
                        "params": [
                          Node {
                            "end": 624,
                            "loc": SourceLocation {
                              "end": Position {
                                "column": 36,
                                "index": 624,
                                "line": 21,
                              },
                              "filename": undefined,
                              "identifierName": "completed",
                              "start": Position {
                                "column": 18,
                                "index": 606,
                                "line": 21,
                              },
                            },
                            "name": "completed",
                            "optional": false,
                            "start": 606,
                            "type": "Identifier",
                            "typeAnnotation": Node {
                              "end": 624,
                              "loc": SourceLocation {
                                "end": Position {
                                  "column": 36,
                                  "index": 624,
                                  "line": 21,
                                },
                                "filename": undefined,
                                "identifierName": undefined,
                                "start": Position {
                                  "column": 27,
                                  "index": 615,
                                  "line": 21,
                                },
                              },
                              "start": 615,
                              "type": "TSTypeAnnotation",
                              "typeAnnotation": Node {
                                "end": 624,
                                "loc": SourceLocation {
                                  "end": Position {
                                    "column": 36,
                                    "index": 624,
                                    "line": 21,
                                  },
                                  "filename": undefined,
                                  "identifierName": undefined,
                                  "start": Position {
                                    "column": 29,
                                    "index": 617,
                                    "line": 21,
                                  },
                                },
                                "start": 617,
                                "type": "TSBooleanKeyword",
                              },
                            },
                          },
                        ],
                        "predicate": null,
                        "readonly": false,
                        "rest": null,
                        "returnType": null,
                        "start": 539,
                        "static": true,
                        "type": "ClassMethod",
                        "typeParameters": null,
                      },
                    ],
                    "end": 815,
                    "loc": SourceLocation {
                      "end": Position {
                        "column": 1,
                        "index": 815,
                        "line": 29,
                      },
                      "filename": undefined,
                      "identifierName": undefined,
                      "start": Position {
                        "column": 29,
                        "index": 167,
                        "line": 5,
                      },
                    },
                    "start": 167,
                    "type": "ClassBody",
                  },
                  "end": 815,
                  "id": Node {
                    "end": 166,
                    "loc": SourceLocation {
                      "end": Position {
                        "column": 28,
                        "index": 166,
                        "line": 5,
                      },
                      "filename": undefined,
                      "identifierName": "TasksController",
                      "start": Position {
                        "column": 13,
                        "index": 151,
                        "line": 5,
                      },
                    },
                    "name": "TasksController",
                    "optional": false,
                    "start": 151,
                    "type": "Identifier",
                    "typeAnnotation": null,
                  },
                  "implements": [],
                  "loc": SourceLocation {
                    "end": Position {
                      "column": 1,
                      "index": 815,
                      "line": 29,
                    },
                    "filename": undefined,
                    "identifierName": undefined,
                    "start": Position {
                      "column": 7,
                      "index": 145,
                      "line": 5,
                    },
                  },
                  "start": 145,
                  "superClass": null,
                  "superTypeParameters": null,
                  "type": "ClassDeclaration",
                  "typeParameters": null,
                },
                "end": 815,
                "exportKind": "value",
                "loc": SourceLocation {
                  "end": Position {
                    "column": 1,
                    "index": 815,
                    "line": 29,
                  },
                  "filename": undefined,
                  "identifierName": undefined,
                  "start": Position {
                    "column": 0,
                    "index": 138,
                    "line": 5,
                  },
                },
                "source": null,
                "specifiers": [],
                "start": 138,
                "type": "ExportNamedDeclaration",
              },
            ],
            "directives": [],
            "end": 817,
            "extra": {
              "topLevelAwait": false,
            },
            "interpreter": null,
            "loc": SourceLocation {
              "end": Position {
                "column": 1,
                "index": 817,
                "line": 30,
              },
              "filename": undefined,
              "identifierName": undefined,
              "start": Position {
                "column": 0,
                "index": 0,
                "line": 1,
              },
            },
            "sourceType": "module",
            "start": 0,
            "type": "Program",
          },
          "start": 0,
          "type": "File",
        },
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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

		const transformed = await transformStrip(code, [{ decorator: 'BackendMethod' }])

		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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

describe('decoratorEntity', () => {
	it('should strip @BackendMethod in @Entity', async () => {
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
`

		const ast_1 = await nullifyImports(code, ['$env/static/private'])
		const transformed = await transformStrip(ast_1.code_ast, [
			{ decorator: 'BackendMethod' },
			{ decorator: 'Entity', args_1: [{ fn: 'backendPrefilter' }] },
		])
		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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
    `)
	})

	it('should strip @BackendMethod in @Entity with excludeEntityKeys', async () => {
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
`

		const ast_1 = await nullifyImports(code, ['$env/static/private'])
		const transformed = await transformStrip(ast_1.code_ast, [
			{ decorator: 'BackendMethod' },
			{
				decorator: 'Entity',
				args_1: [
					{
						fn: 'backendPrefilter',
						excludeEntityKeys: ['users'],
					},
				],
			},
		])
		expect(toInfoCode(transformed)).toMatchInlineSnapshot(`
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
    `)
	})
})
