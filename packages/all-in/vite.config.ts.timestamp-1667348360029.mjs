// vite.config.ts
import { sveltekit } from "file:///home/jycouet/udev/gh/lib/kitql/node_modules/.pnpm/@sveltejs+kit@1.0.0-next.531_svelte@3.50.1+vite@3.2.2/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import "file:///home/jycouet/udev/gh/lib/kitql/node_modules/.pnpm/vite@3.2.2/node_modules/vite/dist/node/index.js";

// src/lib/vite/plugin.ts
import { createContext, generate as codeGen_generate } from "file:///home/jycouet/udev/gh/lib/kitql/node_modules/.pnpm/@graphql-codegen+cli@2.13.8_nlbch44dn2bygutja6asmrx65q/node_modules/@graphql-codegen/cli/esm/index.js";
import "file:///home/jycouet/udev/gh/lib/kitql/packages/helper/dist/esm/index.js";
import { resolve } from "path";
import watch_and_run from "file:///home/jycouet/udev/gh/lib/kitql/packages/vite-plugin-watch-and-run/dist/esm/index.js";

// src/lib/vite/generate.ts
import { Log, logGreen, logRed } from "file:///home/jycouet/udev/gh/lib/kitql/packages/helper/dist/esm/index.js";
import { basename as basename2, extname as extname3, join as join8 } from "path";

// src/lib/vite/actionContexts.ts
function actionContext(ctxModules, outputFolder) {
}

// src/lib/vite/actionEnum.ts
import { existsSync as existsSync3 } from "fs";
import { join as join3 } from "path";

// src/lib/vite/fileFolder.ts
import { existsSync, mkdirSync, readdirSync } from "fs";
import glob from "file:///home/jycouet/udev/gh/lib/kitql/node_modules/.pnpm/glob@8.0.3/node_modules/glob/glob.js";
import { extname, join } from "path";
var rootPath = process.cwd();
var getDirectories = (source) => {
  const directories = glob.sync(source).flat().filter((path) => !extname(path));
  return directories;
};
function getFiles(source) {
  if (existsSync(source)) {
    return readdirSync(source, { withFileTypes: true }).filter((dirent) => dirent.isFile()).map((dirent) => dirent.name);
  }
  return [];
}
function getFileWOTS(str) {
  return str.replace(".ts", "");
}
function getFileWODots(str) {
  return getFileWOTS(str).replace(".", "");
}
function createFolderIfNotExists(folder) {
  if (!existsSync(folder)) {
    mkdirSync(folder, { recursive: true });
  }
}
function getFullPath(folder) {
  if (folder.startsWith("/")) {
    return folder;
  }
  return join(rootPath, folder);
}

// src/lib/vite/formatString.ts
function toPascalCase(input) {
  return `${input}`.replace(new RegExp(/[-_]+/, "g"), " ").replace(new RegExp(/[^\w\s]/, "g"), "").replace(new RegExp(/\s+(.)(\w+)/, "g"), ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`).replace(new RegExp(/\s/, "g"), "").replace(new RegExp(/\w/), (s) => s.toUpperCase());
}

// src/lib/vite/readWrite.ts
import { existsSync as existsSync2, readFileSync, writeFileSync } from "fs";
import { dirname, join as join2 } from "path";
function read(pathFile) {
  return readFileSync(pathFile, { encoding: "utf8" });
}
function readLines(pathFile) {
  return read(pathFile).split("\n");
}
function write(pathFile, data) {
  const fullDataToWrite = Array.isArray(data) ? data.join("\n") : data;
  createFolderIfNotExists(dirname(pathFile));
  if (existsSync2(pathFile)) {
    const currentFileData = read(pathFile);
    if (fullDataToWrite === currentFileData) {
      return;
    }
  }
  writeFileSync(join2(pathFile), fullDataToWrite);
}

// src/lib/vite/actionEnum.ts
function actionEnum(enumsModuleFolder, moduleOutputFolder, importBaseTypesFrom, enums) {
  createFolderIfNotExists(join3(enumsModuleFolder, "_enums"));
  createFolderIfNotExists(join3(enumsModuleFolder, "_enums", "typedefs"));
  for (const key in enums) {
    const list = enums[key];
    const enumFileData2 = [];
    enumFileData2.push(`enum ${key} {`);
    list.forEach((c) => {
      enumFileData2.push(`	${c}`);
    });
    enumFileData2.push(`}`);
    enumFileData2.push(``);
    write(join3(enumsModuleFolder, "_enums", "typedefs", `ENUM.${key}.graphql`), enumFileData2);
  }
  createFolderIfNotExists(join3(enumsModuleFolder, "_enums", "ui"));
  createFolderIfNotExists(join3(enumsModuleFolder, "_enums", "ui", "lists"));
  for (const key in enums) {
    const list = enums[key];
    const keyWOEnum = key.replace("Enum", "");
    const enumFileData2 = [];
    enumFileData2.push(`import { type ${key} } from '${importBaseTypesFrom}';`);
    enumFileData2.push(``);
    enumFileData2.push(`export const ${keyWOEnum}List: Record<${key}, string> = {`);
    list.forEach((c, i) => {
      const isLast = i === list.length - 1;
      enumFileData2.push(`	${c}: '${toPascalCase(c.toLowerCase())}'${isLast ? "" : ","}`);
    });
    enumFileData2.push(`};`);
    enumFileData2.push(``);
    if (!existsSync3(join3(enumsModuleFolder, "_enums", "ui", "lists", `${keyWOEnum}List.ts`))) {
      write(join3(enumsModuleFolder, "_enums", "ui", "lists", `${keyWOEnum}List.ts`), enumFileData2);
    }
  }
  const enumFileData = [];
  enumFileData.push(`import { createModule } from 'graphql-modules'`);
  enumFileData.push(``);
  enumFileData.push(`import { typeDefs } from './${moduleOutputFolder}/typedefs'`);
  enumFileData.push(``);
  enumFileData.push(`export const _enumsModule = createModule({`);
  enumFileData.push(`	id: 'enums-module',`);
  enumFileData.push(`	typeDefs`);
  enumFileData.push(`})`);
  enumFileData.push(``);
  write(join3(enumsModuleFolder, "_enums", "index.ts"), enumFileData);
  const enumsKeys = Object.keys(enums).map((key) => {
    return key;
  });
  return enumsKeys;
}

// src/lib/vite/actionModuleContext.ts
import { basename, extname as extname2, join as join4 } from "path";
function actionModuleContext(dataloadersModule, moduleFolder, moduleOutputFolder, importBaseTypesFrom, withDbProvider) {
  const dataCtxModules = [];
  const moduleName = basename(moduleFolder, extname2(moduleFolder));
  const moduleNamePascalCase = toPascalCase(moduleName);
  const functionsName = [];
  dataloadersModule.forEach((dataloader) => {
    const functionName = dataloader.providerFile.substring(moduleName.length + 2 + 3).replace(`s.ts`, "");
    functionsName.push(functionName);
  });
  if (withDbProvider) {
    dataCtxModules.push(`import { load_DataLoader } from '../../../../lib/graphql/helpers/dataLoaderHelper';`);
    dataCtxModules.push(`import type { IKitQLContext } from '../../../../lib/graphql/kitQLServer';`);
    if (functionsName.length > 0) {
      dataCtxModules.push(`import type { ${moduleNamePascalCase} } from '${importBaseTypesFrom}';`);
    }
    dataCtxModules.push(`import { Db${moduleNamePascalCase} } from '../providers/Db${moduleNamePascalCase}';`);
    functionsName.forEach((functionName) => {
      dataCtxModules.push(
        `import { dl${moduleNamePascalCase}Get${functionName}s } from '../providers/dl${moduleNamePascalCase}Get${functionName}s';`
      );
    });
    dataCtxModules.push(``);
    dataCtxModules.push(`export function ctx${moduleNamePascalCase}(ctx: IKitQLContext) {`);
    dataCtxModules.push(` // @ts-ignore`);
    dataCtxModules.push(` return ctx.injector.get(Db${moduleNamePascalCase}) as Db${moduleNamePascalCase};`);
    dataCtxModules.push(`}`);
    dataCtxModules.push(``);
  } else {
    dataCtxModules.push(`// No DbProvider found`);
    dataCtxModules.push(`export {}`);
  }
  functionsName.forEach((functionName) => {
    dataCtxModules.push(
      `export async function ctx${moduleNamePascalCase}_Dl_${functionName}(ctx: IKitQLContext, id: string | number) {`
    );
    dataCtxModules.push(` // @ts-ignore`);
    dataCtxModules.push(
      `	return load_DataLoader<${moduleNamePascalCase}>(ctx.injector, dl${moduleNamePascalCase}Get${functionName}s.provide, id) as ${moduleNamePascalCase};`
    );
    dataCtxModules.push(`}`);
  });
  dataCtxModules.push(``);
  createFolderIfNotExists(join4(moduleFolder, moduleOutputFolder));
  write(join4(moduleFolder, moduleOutputFolder, "ctx.ts"), dataCtxModules);
  return functionsName.length + (withDbProvider ? 1 : 0);
}

// src/lib/vite/actionModules.ts
import { join as join5, posix } from "path";
function actionModules(modules, outputFolder) {
  const modulesImports = [];
  const modulesExports = [];
  const dataAppModules = [];
  modules.forEach((module) => {
    const moduleRelativePath = posix.relative(outputFolder, module.directory);
    modulesImports.push(`import { ${module.name}Module } from '${moduleRelativePath}';`);
    modulesExports.push(`  ${module.name}Module,`);
  });
  dataAppModules.push(modulesImports.join("\n"));
  dataAppModules.push(``);
  dataAppModules.push(`export const modules = [`);
  dataAppModules.push(modulesExports.join("\n"));
  dataAppModules.push(`];`);
  createFolderIfNotExists(join5(outputFolder));
  write(join5(outputFolder, "_appModules.ts"), dataAppModules);
}

// src/lib/vite/actionResolvers.ts
import { join as join6, posix as posix2 } from "path";
function actionResolvers(moduleFolder, moduleOutputFolder) {
  const resolversFolder = "resolvers";
  const relativeResolversFolder = posix2.relative(moduleOutputFolder, resolversFolder);
  const resolversFiles = getFiles(join6(moduleFolder, resolversFolder));
  const dataResolvers = [];
  resolversFiles.forEach((resolver) => {
    dataResolvers.push(
      `import { resolvers as ${getFileWODots(resolver)} } from '${posix2.join(
        relativeResolversFolder,
        getFileWOTS(resolver)
      )}';`
    );
  });
  dataResolvers.push(``);
  dataResolvers.push(`export const resolvers = [`);
  resolversFiles.forEach((resolver) => {
    dataResolvers.push(`  ${getFileWODots(resolver)},`);
  });
  dataResolvers.push(`];`);
  createFolderIfNotExists(join6(moduleFolder, moduleOutputFolder));
  write(join6(moduleFolder, moduleOutputFolder, "resolvers.ts"), dataResolvers);
  return resolversFiles.length;
}

// src/lib/vite/actionTypeDefs.ts
import { join as join7 } from "path";
function actionTypeDefs(moduleFolder, moduleOutputFolder, localDev) {
  const typedefsFolder = "typedefs";
  const typedefsFiles = getFiles(join7(moduleFolder, typedefsFolder));
  const dataTypedefs = [];
  if (typedefsFiles.length > 0) {
    dataTypedefs.push(`import { gql } from ${localDev ? `'graphql-modules'` : `'@kitql/all-in'`}`);
    dataTypedefs.push(``);
    dataTypedefs.push(`export const typeDefs = gql${"`"}`);
    typedefsFiles.forEach((typedefs) => {
      dataTypedefs.push(read(join7(moduleFolder, typedefsFolder, typedefs)));
    });
    dataTypedefs.push(`${"`"};`);
  } else {
    dataTypedefs.push(`// No typedefs!`);
    dataTypedefs.push(``);
    dataTypedefs.push(`export const typeDefs = null`);
  }
  createFolderIfNotExists(join7(moduleFolder, moduleOutputFolder));
  write(join7(moduleFolder, moduleOutputFolder, "typedefs.ts"), dataTypedefs);
  return typedefsFiles.length;
}

// src/lib/vite/prismaHelper.ts
function getPrismaEnum(lines) {
  const enums = {};
  let currentEnum = "";
  lines.forEach((line) => {
    if (currentEnum !== "") {
      if (line.includes("}")) {
        currentEnum = "";
      } else {
        enums[currentEnum].push(line.trim());
      }
    }
    if (line.startsWith("enum")) {
      const [, enumName] = line.split(" ");
      currentEnum = toPascalCase(enumName);
      enums[currentEnum] = [];
    }
  });
  return enums;
}

// src/lib/vite/generate.ts
function generate(config2) {
  const log = new Log("KitQL");
  const providersFolder = "providers";
  const { outputFolder, moduleOutputFolder, importBaseTypesFrom, modules, localDev } = {
    outputFolder: "src/lib/graphql/$kitql",
    moduleOutputFolder: "$kitql",
    importBaseTypesFrom: "$graphql/$kitql/graphqlTypes",
    modules: ["src/lib/modules/*"],
    localDev: false,
    ...config2
  };
  const { mergeModuleTypedefs, mergeModuleResolvers, mergeContexts, mergeModules } = {
    mergeModuleTypedefs: true,
    mergeModuleResolvers: true,
    mergeContexts: true,
    mergeModules: true
  };
  const meta = {
    enums: 0,
    modules: 0,
    typedefs: 0,
    resolvers: 0,
    contexts: 0
  };
  if (config2 == null ? void 0 : config2.createEnumsModule) {
    const { prismaFile, enumsModuleFolder } = {
      prismaFile: "",
      enumsModuleFolder: "",
      ...config2 == null ? void 0 : config2.createEnumsModule
    };
    const prismaFilePath = getFullPath(prismaFile);
    if (readLines(prismaFilePath).length === 0) {
      const enums = getPrismaEnum(readLines(prismaFilePath));
      const enumsKeys = actionEnum(enumsModuleFolder, moduleOutputFolder, importBaseTypesFrom, enums);
      meta.enums = enumsKeys.length;
    } else {
      log.error(`${"\u274C"} file ${logRed(prismaFilePath)} not found!`);
      throw new Error(`file ${prismaFilePath} not found!`);
    }
  }
  const mergeModuleAction = [];
  if (mergeModuleTypedefs) {
    mergeModuleAction.push("Typedefs");
  }
  if (mergeModuleResolvers) {
    mergeModuleAction.push("Resolvers");
  }
  if (mergeContexts) {
    mergeModuleAction.push("Contexts");
  }
  if (mergeModuleAction.length > 0) {
  }
  const contexts = [];
  const modulesObj = [];
  modules.forEach((source) => {
    const directories = getDirectories(source);
    directories.forEach((directory) => {
      const moduleName = basename2(directory, extname3(directory));
      let typedefsFilesLength = 0;
      let resolversFilesLength = 0;
      let contextsFilesLength = 0;
      if (mergeModuleTypedefs) {
        typedefsFilesLength = actionTypeDefs(directory, moduleOutputFolder, localDev);
      }
      if (mergeModuleResolvers) {
        resolversFilesLength = actionResolvers(directory, moduleOutputFolder);
      }
      if (mergeContexts) {
        const dataloadersModule = [];
        const providersFiles = getFiles(join8(directory, providersFolder));
        let withDbProvider = false;
        providersFiles.forEach((providerFile) => {
          if (providerFile.startsWith(`dl${toPascalCase(moduleName)}`)) {
            dataloadersModule.push({ moduleName, providerFile });
          }
          if (providerFile.startsWith(`Db${toPascalCase(moduleName)}`)) {
            withDbProvider = true;
          }
        });
        contextsFilesLength = actionModuleContext(
          dataloadersModule,
          directory,
          moduleOutputFolder,
          importBaseTypesFrom,
          withDbProvider
        );
        providersFiles.forEach((providerFile) => {
          if (providerFile.startsWith("_ctx")) {
            const ctxName = providerFile.replace("_ctx", "").replace(".ts", "");
            contexts.push({ moduleName, ctxName });
          }
        });
      }
      if (mergeModuleAction.length > 0) {
        meta.typedefs += typedefsFilesLength;
        meta.resolvers += resolversFilesLength;
        meta.contexts += contextsFilesLength;
      }
      modulesObj.push({ directory, name: moduleName });
    });
  });
  if (mergeContexts) {
    actionContext(contexts, outputFolder);
  }
  if (mergeModules) {
    actionModules(modulesObj, outputFolder);
    meta.modules = modulesObj.length;
  }
  log.info(
    `${logGreen("\u2714")} success [${logGreen("" + meta.modules)} modules, ${logGreen("" + meta.enums)} enums, ${logGreen("" + meta.typedefs)} typedefs, ${logGreen("" + meta.resolvers)} resolvers, ${logGreen("" + meta.contexts)} contexts]`
  );
}

// src/lib/vite/plugin.ts
function kitql(config2) {
  return [
    {
      name: "kitql",
      async buildStart() {
        await gooo(config2);
      }
    },
    watch_and_run([
      {
        name: "kitql",
        watch: resolve("src/**/*.(graphql)"),
        run: () => gooo(config2)
      }
    ])
  ];
}
async function gooo(config2) {
  try {
    const context = await createContext({
      project: (config2 == null ? void 0 : config2.projectName) ?? "init",
      config: "",
      watch: false,
      require: [],
      overwrite: true,
      silent: true,
      errorsOnly: false,
      profile: false
    });
    await codeGen_generate(context);
    generate(config2);
  } catch (e) {
    console.error(e);
  }
}

// vite.config.ts
var config = {
  plugins: [kitql({ projectName: "myPrj", localDev: true }), sveltekit()],
  optimizeDeps: {
    include: ["safe-stable-stringify"]
  },
  build: {
    rollupOptions: {
      external: [
        "@graphql-yoga/render-graphiql"
      ]
    }
  }
};
var vite_config_default = config;
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL2xpYi92aXRlL3BsdWdpbi50cyIsICJzcmMvbGliL3ZpdGUvZ2VuZXJhdGUudHMiLCAic3JjL2xpYi92aXRlL2FjdGlvbkNvbnRleHRzLnRzIiwgInNyYy9saWIvdml0ZS9hY3Rpb25FbnVtLnRzIiwgInNyYy9saWIvdml0ZS9maWxlRm9sZGVyLnRzIiwgInNyYy9saWIvdml0ZS9mb3JtYXRTdHJpbmcudHMiLCAic3JjL2xpYi92aXRlL3JlYWRXcml0ZS50cyIsICJzcmMvbGliL3ZpdGUvYWN0aW9uTW9kdWxlQ29udGV4dC50cyIsICJzcmMvbGliL3ZpdGUvYWN0aW9uTW9kdWxlcy50cyIsICJzcmMvbGliL3ZpdGUvYWN0aW9uUmVzb2x2ZXJzLnRzIiwgInNyYy9saWIvdml0ZS9hY3Rpb25UeXBlRGVmcy50cyIsICJzcmMvbGliL3ZpdGUvcHJpc21hSGVscGVyLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgc3ZlbHRla2l0IH0gZnJvbSAnQHN2ZWx0ZWpzL2tpdC92aXRlJ1xuaW1wb3J0IHsgdHlwZSBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSdcblxuaW1wb3J0IHsga2l0cWwgfSBmcm9tICcuL3NyYy9saWIvdml0ZS9wbHVnaW4uanMnXG5cbi8vIGltcG9ydCB7IGtpdHFsIH0gZnJvbSAnQGtpdHFsL2FsbC1pbidcblxuY29uc3QgY29uZmlnOiBVc2VyQ29uZmlnID0ge1xuICBwbHVnaW5zOiBba2l0cWwoeyBwcm9qZWN0TmFtZTogJ215UHJqJywgbG9jYWxEZXY6IHRydWUgfSksIHN2ZWx0ZWtpdCgpXSxcblxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3NhZmUtc3RhYmxlLXN0cmluZ2lmeSddLFxuICB9LFxuXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgJ0BncmFwaHFsLXlvZ2EvcmVuZGVyLWdyYXBoaXFsJywgLy8gVXNlcnMgd2lsbCBkZWNpZGUgdG8gb3B0LWluIGJ5IGFkZGluZyB0aGlzIGRlcCAob3Igbm90KVxuICAgICAgXSxcbiAgICB9LFxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBjb25maWdcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvcGx1Z2luLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3NyYy9saWIvdml0ZS9wbHVnaW4udHNcIjtpbXBvcnQgeyBjcmVhdGVDb250ZXh0LCBnZW5lcmF0ZSBhcyBjb2RlR2VuX2dlbmVyYXRlIH0gZnJvbSAnQGdyYXBocWwtY29kZWdlbi9jbGknXG5pbXBvcnQgeyBMb2csIGxvZ0dyZWVuIH0gZnJvbSAnQGtpdHFsL2hlbHBlcidcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHdhdGNoX2FuZF9ydW4gZnJvbSAndml0ZS1wbHVnaW4td2F0Y2gtYW5kLXJ1bidcblxuaW1wb3J0IHR5cGUgeyBLaXRRTFZpdGUgfSBmcm9tICcuL0tpdFFMVml0ZS5qcydcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSAnLi9nZW5lcmF0ZS5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGtpdHFsKGNvbmZpZz86IEtpdFFMVml0ZSk6IFBsdWdpbltdIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBuYW1lOiAna2l0cWwnLFxuXG4gICAgICBhc3luYyBidWlsZFN0YXJ0KCkge1xuICAgICAgICBhd2FpdCBnb29vKGNvbmZpZylcbiAgICAgIH0sXG4gICAgfSxcbiAgICB3YXRjaF9hbmRfcnVuKFtcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ2tpdHFsJyxcbiAgICAgICAgd2F0Y2g6IHJlc29sdmUoJ3NyYy8qKi8qLihncmFwaHFsKScpLFxuICAgICAgICBydW46ICgpID0+IGdvb28oY29uZmlnKSxcbiAgICAgIH0sXG4gICAgXSksXG4gIF1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ29vbyhjb25maWc/OiBLaXRRTFZpdGUpIHtcbiAgdHJ5IHtcbiAgICAvLyBDb2RlZ2VuXG4gICAgY29uc3QgY29udGV4dCA9IGF3YWl0IGNyZWF0ZUNvbnRleHQoe1xuICAgICAgcHJvamVjdDogY29uZmlnPy5wcm9qZWN0TmFtZSA/PyAnaW5pdCcsXG4gICAgICBjb25maWc6ICcnLFxuICAgICAgd2F0Y2g6IGZhbHNlLFxuICAgICAgcmVxdWlyZTogW10sXG4gICAgICBvdmVyd3JpdGU6IHRydWUsXG4gICAgICBzaWxlbnQ6IHRydWUsXG4gICAgICBlcnJvcnNPbmx5OiBmYWxzZSxcbiAgICAgIHByb2ZpbGU6IGZhbHNlLFxuICAgIH0pXG5cbiAgICBhd2FpdCBjb2RlR2VuX2dlbmVyYXRlKGNvbnRleHQpXG5cbiAgICAvLyBLaXRRTFxuICAgIGdlbmVyYXRlKGNvbmZpZylcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSlcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3NyYy9saWIvdml0ZS9nZW5lcmF0ZS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvZ2VuZXJhdGUudHNcIjtpbXBvcnQgeyBMb2csIGxvZ0dyZWVuLCBsb2dSZWQgfSBmcm9tICdAa2l0cWwvaGVscGVyJ1xuaW1wb3J0IHsgYmFzZW5hbWUsIGV4dG5hbWUsIGpvaW4gfSBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgdHlwZSB7IEtpdFFMVml0ZSB9IGZyb20gJy4vS2l0UUxWaXRlLmpzJ1xuaW1wb3J0IHsgYWN0aW9uQ29udGV4dCB9IGZyb20gJy4vYWN0aW9uQ29udGV4dHMuanMnXG5pbXBvcnQgeyBhY3Rpb25FbnVtIH0gZnJvbSAnLi9hY3Rpb25FbnVtLmpzJ1xuaW1wb3J0IHsgYWN0aW9uTW9kdWxlQ29udGV4dCB9IGZyb20gJy4vYWN0aW9uTW9kdWxlQ29udGV4dC5qcydcbmltcG9ydCB7IGFjdGlvbk1vZHVsZXMgfSBmcm9tICcuL2FjdGlvbk1vZHVsZXMuanMnXG5pbXBvcnQgeyBhY3Rpb25SZXNvbHZlcnMgfSBmcm9tICcuL2FjdGlvblJlc29sdmVycy5qcydcbmltcG9ydCB7IGFjdGlvblR5cGVEZWZzIH0gZnJvbSAnLi9hY3Rpb25UeXBlRGVmcy5qcydcbmltcG9ydCB7IGdldERpcmVjdG9yaWVzLCBnZXRGaWxlcywgZ2V0RnVsbFBhdGggfSBmcm9tICcuL2ZpbGVGb2xkZXIuanMnXG5pbXBvcnQgeyB0b1Bhc2NhbENhc2UgfSBmcm9tICcuL2Zvcm1hdFN0cmluZy5qcydcbmltcG9ydCB7IGdldFByaXNtYUVudW0gfSBmcm9tICcuL3ByaXNtYUhlbHBlci5qcydcbmltcG9ydCB7IHJlYWRMaW5lcyB9IGZyb20gJy4vcmVhZFdyaXRlLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGUoY29uZmlnPzogS2l0UUxWaXRlKSB7XG4gIGNvbnN0IGxvZyA9IG5ldyBMb2coJ0tpdFFMJylcblxuICBjb25zdCBwcm92aWRlcnNGb2xkZXIgPSAncHJvdmlkZXJzJyBhcyBjb25zdFxuXG4gIGNvbnN0IHsgb3V0cHV0Rm9sZGVyLCBtb2R1bGVPdXRwdXRGb2xkZXIsIGltcG9ydEJhc2VUeXBlc0Zyb20sIG1vZHVsZXMsIGxvY2FsRGV2IH0gPSB7XG4gICAgb3V0cHV0Rm9sZGVyOiAnc3JjL2xpYi9ncmFwaHFsLyRraXRxbCcsXG4gICAgbW9kdWxlT3V0cHV0Rm9sZGVyOiAnJGtpdHFsJyxcbiAgICBpbXBvcnRCYXNlVHlwZXNGcm9tOiAnJGdyYXBocWwvJGtpdHFsL2dyYXBocWxUeXBlcycsXG4gICAgbW9kdWxlczogWydzcmMvbGliL21vZHVsZXMvKiddLFxuICAgIGxvY2FsRGV2OiBmYWxzZSxcbiAgICAuLi5jb25maWcsXG4gIH1cblxuICBjb25zdCB7IG1lcmdlTW9kdWxlVHlwZWRlZnMsIG1lcmdlTW9kdWxlUmVzb2x2ZXJzLCBtZXJnZUNvbnRleHRzLCBtZXJnZU1vZHVsZXMgfSA9IHtcbiAgICBtZXJnZU1vZHVsZVR5cGVkZWZzOiB0cnVlLFxuICAgIG1lcmdlTW9kdWxlUmVzb2x2ZXJzOiB0cnVlLFxuICAgIG1lcmdlQ29udGV4dHM6IHRydWUsXG4gICAgbWVyZ2VNb2R1bGVzOiB0cnVlLFxuICB9XG5cbiAgY29uc3QgbWV0YSA9IHtcbiAgICBlbnVtczogMCxcbiAgICBtb2R1bGVzOiAwLFxuICAgIHR5cGVkZWZzOiAwLFxuICAgIHJlc29sdmVyczogMCxcbiAgICBjb250ZXh0czogMCxcbiAgfVxuXG4gIC8vIEVudW1zXG4gIGlmIChjb25maWc/LmNyZWF0ZUVudW1zTW9kdWxlKSB7XG4gICAgY29uc3QgeyBwcmlzbWFGaWxlLCBlbnVtc01vZHVsZUZvbGRlciB9ID0ge1xuICAgICAgcHJpc21hRmlsZTogJycsXG4gICAgICBlbnVtc01vZHVsZUZvbGRlcjogJycsXG4gICAgICAuLi5jb25maWc/LmNyZWF0ZUVudW1zTW9kdWxlLFxuICAgIH1cblxuICAgIGNvbnN0IHByaXNtYUZpbGVQYXRoID0gZ2V0RnVsbFBhdGgocHJpc21hRmlsZSlcbiAgICBpZiAocmVhZExpbmVzKHByaXNtYUZpbGVQYXRoKS5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnN0IGVudW1zID0gZ2V0UHJpc21hRW51bShyZWFkTGluZXMocHJpc21hRmlsZVBhdGgpKVxuICAgICAgY29uc3QgZW51bXNLZXlzID0gYWN0aW9uRW51bShlbnVtc01vZHVsZUZvbGRlciwgbW9kdWxlT3V0cHV0Rm9sZGVyLCBpbXBvcnRCYXNlVHlwZXNGcm9tLCBlbnVtcylcbiAgICAgIG1ldGEuZW51bXMgPSBlbnVtc0tleXMubGVuZ3RoXG4gICAgICAvLyBsb2cuaW5mbyhgJHtsb2dHcmVlbignXHUyNzE0Jyl9ICR7bG9nR3JlZW4oJ0VudW1zJyl9IGNyZWF0ZWQgWyR7ZW51bXNLZXlzLm1hcChjID0+IGxvZ0dyZWVuKGMpKS5qb2luKCcsJyl9XWApXG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZy5lcnJvcihgJHsnXHUyNzRDJ30gZmlsZSAke2xvZ1JlZChwcmlzbWFGaWxlUGF0aCl9IG5vdCBmb3VuZCFgKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBmaWxlICR7cHJpc21hRmlsZVBhdGh9IG5vdCBmb3VuZCFgKVxuICAgIH1cbiAgfVxuXG4gIC8vIFR5cGVkZWZzICYmIFJlc29sdmVyc1xuICBjb25zdCBtZXJnZU1vZHVsZUFjdGlvbiA9IFtdXG4gIGlmIChtZXJnZU1vZHVsZVR5cGVkZWZzKSB7XG4gICAgbWVyZ2VNb2R1bGVBY3Rpb24ucHVzaCgnVHlwZWRlZnMnKVxuICB9XG4gIGlmIChtZXJnZU1vZHVsZVJlc29sdmVycykge1xuICAgIG1lcmdlTW9kdWxlQWN0aW9uLnB1c2goJ1Jlc29sdmVycycpXG4gIH1cbiAgaWYgKG1lcmdlQ29udGV4dHMpIHtcbiAgICBtZXJnZU1vZHVsZUFjdGlvbi5wdXNoKCdDb250ZXh0cycpXG4gIH1cbiAgaWYgKG1lcmdlTW9kdWxlQWN0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAvLyBsb2cuaW5mbyhgJHtsb2dHcmVlbignXHUyM0YzJyl9IG1lcmdpbmcgJHttZXJnZU1vZHVsZUFjdGlvbi5tYXAoYyA9PiBsb2dHcmVlbihjKSkuam9pbignIGFuZCAnKX0gaW4gbW9kdWxlc2ApXG4gIH1cblxuICBjb25zdCBjb250ZXh0czogeyBtb2R1bGVOYW1lOiBzdHJpbmc7IGN0eE5hbWU6IHN0cmluZyB9W10gPSBbXVxuICBjb25zdCBtb2R1bGVzT2JqOiB7IG5hbWU6IHN0cmluZzsgZGlyZWN0b3J5OiBzdHJpbmcgfVtdID0gW11cbiAgbW9kdWxlcy5mb3JFYWNoKChzb3VyY2U6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGRpcmVjdG9yaWVzID0gZ2V0RGlyZWN0b3JpZXMoc291cmNlKVxuICAgIGRpcmVjdG9yaWVzLmZvckVhY2goZGlyZWN0b3J5ID0+IHtcbiAgICAgIGNvbnN0IG1vZHVsZU5hbWUgPSBiYXNlbmFtZShkaXJlY3RvcnksIGV4dG5hbWUoZGlyZWN0b3J5KSlcblxuICAgICAgbGV0IHR5cGVkZWZzRmlsZXNMZW5ndGggPSAwXG4gICAgICBsZXQgcmVzb2x2ZXJzRmlsZXNMZW5ndGggPSAwXG4gICAgICBsZXQgY29udGV4dHNGaWxlc0xlbmd0aCA9IDBcblxuICAgICAgLy8gVHlwZURlZnNcbiAgICAgIGlmIChtZXJnZU1vZHVsZVR5cGVkZWZzKSB7XG4gICAgICAgIHR5cGVkZWZzRmlsZXNMZW5ndGggPSBhY3Rpb25UeXBlRGVmcyhkaXJlY3RvcnksIG1vZHVsZU91dHB1dEZvbGRlciwgbG9jYWxEZXYpXG4gICAgICB9XG5cbiAgICAgIC8vIFJlc29sdmVyc1xuICAgICAgaWYgKG1lcmdlTW9kdWxlUmVzb2x2ZXJzKSB7XG4gICAgICAgIHJlc29sdmVyc0ZpbGVzTGVuZ3RoID0gYWN0aW9uUmVzb2x2ZXJzKGRpcmVjdG9yeSwgbW9kdWxlT3V0cHV0Rm9sZGVyKVxuICAgICAgfVxuXG4gICAgICAvLyBDb250ZXh0c1xuICAgICAgaWYgKG1lcmdlQ29udGV4dHMpIHtcbiAgICAgICAgY29uc3QgZGF0YWxvYWRlcnNNb2R1bGU6IHsgbW9kdWxlTmFtZTogc3RyaW5nOyBwcm92aWRlckZpbGU6IHN0cmluZyB9W10gPSBbXVxuICAgICAgICBjb25zdCBwcm92aWRlcnNGaWxlcyA9IGdldEZpbGVzKGpvaW4oZGlyZWN0b3J5LCBwcm92aWRlcnNGb2xkZXIpKVxuICAgICAgICBsZXQgd2l0aERiUHJvdmlkZXIgPSBmYWxzZVxuICAgICAgICBwcm92aWRlcnNGaWxlcy5mb3JFYWNoKHByb3ZpZGVyRmlsZSA9PiB7XG4gICAgICAgICAgaWYgKHByb3ZpZGVyRmlsZS5zdGFydHNXaXRoKGBkbCR7dG9QYXNjYWxDYXNlKG1vZHVsZU5hbWUpfWApKSB7XG4gICAgICAgICAgICBkYXRhbG9hZGVyc01vZHVsZS5wdXNoKHsgbW9kdWxlTmFtZSwgcHJvdmlkZXJGaWxlIH0pXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwcm92aWRlckZpbGUuc3RhcnRzV2l0aChgRGIke3RvUGFzY2FsQ2FzZShtb2R1bGVOYW1lKX1gKSkge1xuICAgICAgICAgICAgd2l0aERiUHJvdmlkZXIgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBjb250ZXh0c0ZpbGVzTGVuZ3RoID0gYWN0aW9uTW9kdWxlQ29udGV4dChcbiAgICAgICAgICBkYXRhbG9hZGVyc01vZHVsZSxcbiAgICAgICAgICBkaXJlY3RvcnksXG4gICAgICAgICAgbW9kdWxlT3V0cHV0Rm9sZGVyLFxuICAgICAgICAgIGltcG9ydEJhc2VUeXBlc0Zyb20sXG4gICAgICAgICAgd2l0aERiUHJvdmlkZXJcbiAgICAgICAgKVxuXG4gICAgICAgIC8vIGxvZy5pbmZvKGAke2xvZ0dyZWVuKCdcdTIzRjMnKX0gbWVyZ2luZyAke2xvZ0dyZWVuKCdDb250ZXh0cycpfWApXG4gICAgICAgIHByb3ZpZGVyc0ZpbGVzLmZvckVhY2gocHJvdmlkZXJGaWxlID0+IHtcbiAgICAgICAgICBpZiAocHJvdmlkZXJGaWxlLnN0YXJ0c1dpdGgoJ19jdHgnKSkge1xuICAgICAgICAgICAgY29uc3QgY3R4TmFtZSA9IHByb3ZpZGVyRmlsZS5yZXBsYWNlKCdfY3R4JywgJycpLnJlcGxhY2UoJy50cycsICcnKVxuICAgICAgICAgICAgY29udGV4dHMucHVzaCh7IG1vZHVsZU5hbWUsIGN0eE5hbWUgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGlmIChtZXJnZU1vZHVsZUFjdGlvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIG1ldGEudHlwZWRlZnMgKz0gdHlwZWRlZnNGaWxlc0xlbmd0aFxuICAgICAgICBtZXRhLnJlc29sdmVycyArPSByZXNvbHZlcnNGaWxlc0xlbmd0aFxuICAgICAgICBtZXRhLmNvbnRleHRzICs9IGNvbnRleHRzRmlsZXNMZW5ndGhcbiAgICAgICAgLy8gbG9nLmluZm8oXG4gICAgICAgIC8vICAgYCR7bG9nR3JlZW4oJ1x1MjcxNCcpfSBtZXJnZWQgLSAke2xvZ0dyZWVuKHBhZCh0eXBlZGVmc0ZpbGVzTGVuZ3RoLCAyKSl9IFR5cGVkZWZzIHwgJHtsb2dHcmVlbihcbiAgICAgICAgLy8gICAgIHBhZChyZXNvbHZlcnNGaWxlc0xlbmd0aCwgMilcbiAgICAgICAgLy8gICApfSBSZXNvbHZlcnMgfCAke2xvZ0dyZWVuKHBhZChjb250ZXh0c0ZpbGVzTGVuZ3RoLCAyKSl9IENvbnRleHRzIGZvciBbJHtsb2dHcmVlbihuYW1lKX1dYFxuICAgICAgICAvLyApXG4gICAgICB9XG5cbiAgICAgIG1vZHVsZXNPYmoucHVzaCh7IGRpcmVjdG9yeSwgbmFtZTogbW9kdWxlTmFtZSB9KVxuICAgIH0pXG4gIH0pXG5cbiAgLy8gbWVyZ2VDb250ZXh0c1xuICBpZiAobWVyZ2VDb250ZXh0cykge1xuICAgIC8vIGxvZy5pbmZvKGAke2xvZ0dyZWVuKCdcdTIzRjMnKX0gbWVyZ2luZyAke2xvZ0dyZWVuKCdDb250ZXh0cycpfWApXG4gICAgYWN0aW9uQ29udGV4dChjb250ZXh0cywgb3V0cHV0Rm9sZGVyKVxuXG4gICAgLy8gbG9nLmluZm8oXG4gICAgLy8gICBgJHtsb2dHcmVlbignXHUyNzE0Jyl9IG1lcmdlZCAke2xvZ0dyZWVuKHBhZChjb250ZXh0cy5sZW5ndGgsIDIpKX0gY29udGV4dHMgWyR7Y29udGV4dHNcbiAgICAvLyAgICAgLm1hcChjID0+IGxvZ0dyZWVuKGMubW9kdWxlTmFtZSArICcjJyArIGMuY3R4TmFtZSkpXG4gICAgLy8gICAgIC5qb2luKCcsJyl9XWBcbiAgICAvLyApXG4gIH1cblxuICAvLyBcImlmXCIgb3IgY29sbGFwc2luZyBwdXJwb3NlXG4gIC8vIGlmICh0cnVlKSB7XG4gIC8vIG1lcmdlTW9kdWxlQ29udGV4dHNcbiAgLy8gaWYgKGNvbmZpZy5hY3Rpb25zLm1lcmdlQ29udGV4dHMpIHtcbiAgLy8gXHRsb2cuaW5mbyhgJHtsb2dHcmVlbignXHUyM0YzJyl9IG1lcmdpbmcgbW9kdWxlcyAke2xvZ0dyZWVuKCdDb250ZXh0cycpfWApO1xuICAvLyBcdGNvbnN0IHByb3ZpZGVyc0ZvbGRlciA9ICdwcm92aWRlcnMnO1xuICAvLyBcdG1vZHVsZU5hbWVzLmZvckVhY2gobW9kdWxlTmFtZSA9PiB7XG4gIC8vIFx0XHRsZXQgZGF0YWxvYWRlcnNNb2R1bGUgPSBbXTtcbiAgLy8gXHRcdGNvbnN0IHByb3ZpZGVyc0ZpbGVzID0gZ2V0RmlsZXMoXG4gIC8vIFx0XHRcdGpvaW4oY29uZmlnLmNvbmZpZy5tb2R1bGVzRm9sZGVyLCBtb2R1bGVOYW1lLCBwcm92aWRlcnNGb2xkZXIpXG4gIC8vIFx0XHQpO1xuICAvLyBcdFx0cHJvdmlkZXJzRmlsZXMuZm9yRWFjaChwcm92aWRlckZpbGUgPT4ge1xuICAvLyBcdFx0XHRpZiAocHJvdmlkZXJGaWxlLnN0YXJ0c1dpdGgoYGRsJHt0b1Bhc2NhbENhc2UobW9kdWxlTmFtZSl9YCkpIHtcbiAgLy8gXHRcdFx0XHRkYXRhbG9hZGVyc01vZHVsZS5wdXNoKHsgbW9kdWxlTmFtZSwgcHJvdmlkZXJGaWxlIH0pO1xuICAvLyBcdFx0XHR9XG4gIC8vIFx0XHR9KTtcbiAgLy8gXHRcdGFjdGlvbk1vZHVsZUNvbnRleHQoXG4gIC8vIFx0XHRcdGRhdGFsb2FkZXJzTW9kdWxlLFxuICAvLyBcdFx0XHRjb25maWcuY29uZmlnLm1vZHVsZXNGb2xkZXIsXG4gIC8vIFx0XHRcdG1vZHVsZU5hbWUsXG4gIC8vIFx0XHRcdGNvbmZpZy5jb25maWcubW9kdWxlT3V0cHV0Rm9sZGVyXG4gIC8vIFx0XHQpO1xuICAvLyBcdFx0bG9nLmluZm8oXG4gIC8vIFx0XHRcdGAke2xvZ0dyZWVuKCdcdTI3MTQnKX0gbWVyZ2VkICR7bG9nR3JlZW4oXG4gIC8vIFx0XHRcdFx0cGFkKGRhdGFsb2FkZXJzTW9kdWxlLmxlbmd0aCwgMilcbiAgLy8gXHRcdFx0KX0gY29udGV4dHMgWyR7ZGF0YWxvYWRlcnNNb2R1bGVcbiAgLy8gXHRcdFx0XHQubWFwKGMgPT4gbG9nR3JlZW4oYy5tb2R1bGVOYW1lICsgJyMnICsgYy5jdHhOYW1lKSlcbiAgLy8gXHRcdFx0XHQuam9pbignLCcpfV1gXG4gIC8vIFx0XHQpO1xuICAvLyBcdH0pO1xuICAvLyB9XG4gIC8vXG4gIC8vIH1cblxuICAvLyBtZXJnZU1vZHVsZXNcbiAgaWYgKG1lcmdlTW9kdWxlcykge1xuICAgIC8vIGxvZy5pbmZvKGAke2xvZ0dyZWVuKCdcdTIzRjMnKX0gbWVyZ2luZyAke2xvZ0dyZWVuKCdNb2R1bGVzJyl9YClcbiAgICBhY3Rpb25Nb2R1bGVzKG1vZHVsZXNPYmosIG91dHB1dEZvbGRlcilcbiAgICBtZXRhLm1vZHVsZXMgPSBtb2R1bGVzT2JqLmxlbmd0aFxuICAgIC8vIGxvZy5pbmZvKFxuICAgIC8vICAgYCR7bG9nR3JlZW4oJ1x1MjcxNCcpfSBtZXJnZWQgJHtsb2dHcmVlbihwYWQobW9kdWxlcy5sZW5ndGgsIDIpKX0gbW9kdWxlcyBbJHttb2R1bGVzXG4gICAgLy8gICAgIC5tYXAoYyA9PiBsb2dHcmVlbihjKSlcbiAgICAvLyAgICAgLmpvaW4oJywnKX1dYFxuICAgIC8vIClcbiAgfVxuXG4gIC8vXG5cbiAgLy8gRG9uZVxuICAvLyBsb2cuaW5mbyhgJHtsb2dHcmVlbignXHUyNzE0Jyl9IGZpbmlzaGVkICR7bG9nR3JlZW4oJ3N1Y2Nlc3NmdWxseScpfWApXG4gIGxvZy5pbmZvKFxuICAgIGAke2xvZ0dyZWVuKCdcdTI3MTQnKX0gc3VjY2VzcyBgICtcbiAgICAgIGBbJHtsb2dHcmVlbignJyArIG1ldGEubW9kdWxlcyl9IG1vZHVsZXMsIGAgK1xuICAgICAgYCR7bG9nR3JlZW4oJycgKyBtZXRhLmVudW1zKX0gZW51bXMsIGAgK1xuICAgICAgYCR7bG9nR3JlZW4oJycgKyBtZXRhLnR5cGVkZWZzKX0gdHlwZWRlZnMsIGAgK1xuICAgICAgYCR7bG9nR3JlZW4oJycgKyBtZXRhLnJlc29sdmVycyl9IHJlc29sdmVycywgYCArXG4gICAgICBgJHtsb2dHcmVlbignJyArIG1ldGEuY29udGV4dHMpfSBjb250ZXh0c11gXG4gIClcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvYWN0aW9uQ29udGV4dHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlL2FjdGlvbkNvbnRleHRzLnRzXCI7Ly8gaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnXG5cbi8vIGltcG9ydCB7IGNyZWF0ZUZvbGRlcklmTm90RXhpc3RzIH0gZnJvbSAnLi9maWxlRm9sZGVyLmpzJ1xuLy8gaW1wb3J0IHsgdG9QYXNjYWxDYXNlIH0gZnJvbSAnLi9mb3JtYXRTdHJpbmcuanMnXG4vLyBpbXBvcnQgeyB3cml0ZSB9IGZyb20gJy4vcmVhZFdyaXRlLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aW9uQ29udGV4dChjdHhNb2R1bGVzOiB7IGN0eE5hbWU6IHN0cmluZzsgbW9kdWxlTmFtZTogc3RyaW5nIH1bXSwgb3V0cHV0Rm9sZGVyOiBzdHJpbmcpIHtcbiAgLy8gY29uc3QgZGF0YUN0eE1vZHVsZXMgPSBbXVxuICAvLyBjdHhNb2R1bGVzLmZvckVhY2goY3R4ID0+IHtcbiAgLy8gICBkYXRhQ3R4TW9kdWxlcy5wdXNoKFxuICAvLyAgICAgYGltcG9ydCB7IGdldEN0eCR7dG9QYXNjYWxDYXNlKGN0eC5jdHhOYW1lKX0gfSBmcm9tICcuLi8uLi9tb2R1bGVzLyR7Y3R4Lm1vZHVsZU5hbWV9L3Byb3ZpZGVycy9fY3R4JHt0b1Bhc2NhbENhc2UoXG4gIC8vICAgICAgIGN0eC5jdHhOYW1lXG4gIC8vICAgICApfSc7YFxuICAvLyAgIClcbiAgLy8gfSlcbiAgLy8gZGF0YUN0eE1vZHVsZXMucHVzaChgYClcbiAgLy8gZGF0YUN0eE1vZHVsZXMucHVzaChgZXhwb3J0IGZ1bmN0aW9uIGdldEN0eE1vZHVsZXMocHJpc21hOiBhbnkpIHtgKVxuICAvLyBkYXRhQ3R4TW9kdWxlcy5wdXNoKGBcdHJldHVybiB7YClcbiAgLy8gY3R4TW9kdWxlcy5mb3JFYWNoKGN0eCA9PiB7XG4gIC8vICAgZGF0YUN0eE1vZHVsZXMucHVzaChgXHRcdC4uLmdldEN0eCR7dG9QYXNjYWxDYXNlKGN0eC5jdHhOYW1lKX0ocHJpc21hKSxgKVxuICAvLyB9KVxuICAvLyBkYXRhQ3R4TW9kdWxlcy5wdXNoKGBcdH07YClcbiAgLy8gZGF0YUN0eE1vZHVsZXMucHVzaChgfWApXG4gIC8vIGNyZWF0ZUZvbGRlcklmTm90RXhpc3RzKGpvaW4ob3V0cHV0Rm9sZGVyKSlcbiAgLy8gd3JpdGUoam9pbihvdXRwdXRGb2xkZXIsICdfY3R4TW9kdWxlcy50cycpLCBkYXRhQ3R4TW9kdWxlcylcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvYWN0aW9uRW51bS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvYWN0aW9uRW51bS50c1wiO2ltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdmcydcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgeyBjcmVhdGVGb2xkZXJJZk5vdEV4aXN0cyB9IGZyb20gJy4vZmlsZUZvbGRlci5qcydcbmltcG9ydCB7IHRvUGFzY2FsQ2FzZSB9IGZyb20gJy4vZm9ybWF0U3RyaW5nLmpzJ1xuaW1wb3J0IHsgd3JpdGUgfSBmcm9tICcuL3JlYWRXcml0ZS5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGlvbkVudW0oXG4gIGVudW1zTW9kdWxlRm9sZGVyOiBzdHJpbmcsXG4gIG1vZHVsZU91dHB1dEZvbGRlcjogc3RyaW5nLFxuICBpbXBvcnRCYXNlVHlwZXNGcm9tOiBzdHJpbmcsXG4gIGVudW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT5cbikge1xuICAvLyBUeXBlZGVmc1xuICBjcmVhdGVGb2xkZXJJZk5vdEV4aXN0cyhqb2luKGVudW1zTW9kdWxlRm9sZGVyLCAnX2VudW1zJykpXG4gIGNyZWF0ZUZvbGRlcklmTm90RXhpc3RzKGpvaW4oZW51bXNNb2R1bGVGb2xkZXIsICdfZW51bXMnLCAndHlwZWRlZnMnKSlcblxuICBmb3IgKGNvbnN0IGtleSBpbiBlbnVtcykge1xuICAgIGNvbnN0IGxpc3QgPSBlbnVtc1trZXldXG4gICAgY29uc3QgZW51bUZpbGVEYXRhID0gW11cblxuICAgIGVudW1GaWxlRGF0YS5wdXNoKGBlbnVtICR7a2V5fSB7YClcbiAgICBsaXN0LmZvckVhY2goYyA9PiB7XG4gICAgICBlbnVtRmlsZURhdGEucHVzaChgXFx0JHtjfWApXG4gICAgfSlcbiAgICBlbnVtRmlsZURhdGEucHVzaChgfWApXG4gICAgZW51bUZpbGVEYXRhLnB1c2goYGApXG5cbiAgICB3cml0ZShqb2luKGVudW1zTW9kdWxlRm9sZGVyLCAnX2VudW1zJywgJ3R5cGVkZWZzJywgYEVOVU0uJHtrZXl9LmdyYXBocWxgKSwgZW51bUZpbGVEYXRhKVxuICB9XG5cbiAgLy8gTGlzdHNcbiAgY3JlYXRlRm9sZGVySWZOb3RFeGlzdHMoam9pbihlbnVtc01vZHVsZUZvbGRlciwgJ19lbnVtcycsICd1aScpKVxuICBjcmVhdGVGb2xkZXJJZk5vdEV4aXN0cyhqb2luKGVudW1zTW9kdWxlRm9sZGVyLCAnX2VudW1zJywgJ3VpJywgJ2xpc3RzJykpXG5cbiAgZm9yIChjb25zdCBrZXkgaW4gZW51bXMpIHtcbiAgICBjb25zdCBsaXN0ID0gZW51bXNba2V5XVxuICAgIGNvbnN0IGtleVdPRW51bSA9IGtleS5yZXBsYWNlKCdFbnVtJywgJycpXG4gICAgY29uc3QgZW51bUZpbGVEYXRhID0gW11cblxuICAgIGVudW1GaWxlRGF0YS5wdXNoKGBpbXBvcnQgeyB0eXBlICR7a2V5fSB9IGZyb20gJyR7aW1wb3J0QmFzZVR5cGVzRnJvbX0nO2ApXG4gICAgZW51bUZpbGVEYXRhLnB1c2goYGApXG4gICAgZW51bUZpbGVEYXRhLnB1c2goYGV4cG9ydCBjb25zdCAke2tleVdPRW51bX1MaXN0OiBSZWNvcmQ8JHtrZXl9LCBzdHJpbmc+ID0ge2ApXG4gICAgbGlzdC5mb3JFYWNoKChjLCBpKSA9PiB7XG4gICAgICBjb25zdCBpc0xhc3QgPSBpID09PSBsaXN0Lmxlbmd0aCAtIDFcbiAgICAgIGVudW1GaWxlRGF0YS5wdXNoKGBcXHQke2N9OiAnJHt0b1Bhc2NhbENhc2UoYy50b0xvd2VyQ2FzZSgpKX0nJHtpc0xhc3QgPyAnJyA6ICcsJ31gKVxuICAgIH0pXG4gICAgZW51bUZpbGVEYXRhLnB1c2goYH07YClcbiAgICBlbnVtRmlsZURhdGEucHVzaChgYClcblxuICAgIC8vIFdyaXRlIHRoaXMgZmlsZSBvbmx5IGlmIGl0IGRvZXNuJ3QgZXhpc3QhXG4gICAgLy8gTGlrZSB0aGlzLCB5b3UgY2FuIGNoYW5nZSB0aGUgdmFsdWUgd2l0aCB0ZXh0IHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gdGhlIFVJIVxuICAgIGlmICghZXhpc3RzU3luYyhqb2luKGVudW1zTW9kdWxlRm9sZGVyLCAnX2VudW1zJywgJ3VpJywgJ2xpc3RzJywgYCR7a2V5V09FbnVtfUxpc3QudHNgKSkpIHtcbiAgICAgIHdyaXRlKGpvaW4oZW51bXNNb2R1bGVGb2xkZXIsICdfZW51bXMnLCAndWknLCAnbGlzdHMnLCBgJHtrZXlXT0VudW19TGlzdC50c2ApLCBlbnVtRmlsZURhdGEpXG4gICAgfVxuICB9XG5cbiAgLy8gSW5kZXhcbiAgY29uc3QgZW51bUZpbGVEYXRhID0gW11cbiAgZW51bUZpbGVEYXRhLnB1c2goYGltcG9ydCB7IGNyZWF0ZU1vZHVsZSB9IGZyb20gJ2dyYXBocWwtbW9kdWxlcydgKVxuICBlbnVtRmlsZURhdGEucHVzaChgYClcbiAgZW51bUZpbGVEYXRhLnB1c2goYGltcG9ydCB7IHR5cGVEZWZzIH0gZnJvbSAnLi8ke21vZHVsZU91dHB1dEZvbGRlcn0vdHlwZWRlZnMnYClcbiAgZW51bUZpbGVEYXRhLnB1c2goYGApXG4gIGVudW1GaWxlRGF0YS5wdXNoKGBleHBvcnQgY29uc3QgX2VudW1zTW9kdWxlID0gY3JlYXRlTW9kdWxlKHtgKVxuICBlbnVtRmlsZURhdGEucHVzaChgXFx0aWQ6ICdlbnVtcy1tb2R1bGUnLGApXG4gIGVudW1GaWxlRGF0YS5wdXNoKGBcXHR0eXBlRGVmc2ApXG4gIGVudW1GaWxlRGF0YS5wdXNoKGB9KWApXG4gIGVudW1GaWxlRGF0YS5wdXNoKGBgKVxuXG4gIHdyaXRlKGpvaW4oZW51bXNNb2R1bGVGb2xkZXIsICdfZW51bXMnLCAnaW5kZXgudHMnKSwgZW51bUZpbGVEYXRhKVxuXG4gIGNvbnN0IGVudW1zS2V5cyA9IE9iamVjdC5rZXlzKGVudW1zKS5tYXAoa2V5ID0+IHtcbiAgICByZXR1cm4ga2V5XG4gIH0pXG4gIHJldHVybiBlbnVtc0tleXNcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvZmlsZUZvbGRlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvZmlsZUZvbGRlci50c1wiO2ltcG9ydCB7IGV4aXN0c1N5bmMsIG1rZGlyU3luYywgcmVhZGRpclN5bmMgfSBmcm9tICdmcydcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2InXG5pbXBvcnQgeyBleHRuYW1lLCBqb2luIH0gZnJvbSAncGF0aCdcblxuY29uc3Qgcm9vdFBhdGggPSBwcm9jZXNzLmN3ZCgpXG5cbmV4cG9ydCBjb25zdCBnZXREaXJlY3RvcmllcyA9IChzb3VyY2U6IHN0cmluZykgPT4ge1xuICBjb25zdCBkaXJlY3Rvcmllczogc3RyaW5nW10gPSBnbG9iXG4gICAgLnN5bmMoc291cmNlKVxuICAgIC5mbGF0KClcbiAgICAuZmlsdGVyKChwYXRoOiBzdHJpbmcpID0+ICFleHRuYW1lKHBhdGgpKVxuICByZXR1cm4gZGlyZWN0b3JpZXNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVzKHNvdXJjZTogc3RyaW5nKSB7XG4gIGlmIChleGlzdHNTeW5jKHNvdXJjZSkpIHtcbiAgICByZXR1cm4gcmVhZGRpclN5bmMoc291cmNlLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSlcbiAgICAgIC5maWx0ZXIoZGlyZW50ID0+IGRpcmVudC5pc0ZpbGUoKSlcbiAgICAgIC5tYXAoZGlyZW50ID0+IGRpcmVudC5uYW1lKVxuICB9XG4gIHJldHVybiBbXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZVdPVFMoc3RyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKCcudHMnLCAnJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVXT0RvdHMoc3RyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGdldEZpbGVXT1RTKHN0cikucmVwbGFjZSgnLicsICcnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRm9sZGVySWZOb3RFeGlzdHMoZm9sZGVyOiBzdHJpbmcpIHtcbiAgaWYgKCFleGlzdHNTeW5jKGZvbGRlcikpIHtcbiAgICBta2RpclN5bmMoZm9sZGVyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsUGF0aChmb2xkZXI6IHN0cmluZykge1xuICBpZiAoZm9sZGVyLnN0YXJ0c1dpdGgoJy8nKSkge1xuICAgIHJldHVybiBmb2xkZXJcbiAgfVxuICByZXR1cm4gam9pbihyb290UGF0aCwgZm9sZGVyKVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3NyYy9saWIvdml0ZS9mb3JtYXRTdHJpbmcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlL2Zvcm1hdFN0cmluZy50c1wiO2V4cG9ydCBmdW5jdGlvbiBwYWQobnVtOiBudW1iZXIsIHNpemUgPSAyKTogc3RyaW5nIHtcbiAgY29uc3QgcyA9ICcwMDAwMDAwMDAnICsgbnVtXG4gIHJldHVybiBzLnN1YnN0cmluZyhzLmxlbmd0aCAtIHNpemUpXG59XG5cbi8qKlxuICogdG9QYXNjYWxDYXNlXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXRcbiAqIEByZXR1cm5zIEEgc3RyaW5nIHRoYXQgaGFzIGJlZW4gY29udmVydGVkIGludG8gUGFzY2FsIENhc2UgZm9yIGtlZXBpbmcgd2l0aCB0aGUgUmVhY3QgTmFtaW5nIGNvbnZlbnRpb24gcmVxdWlyZWQgZm9yIG5hbWluZyBDb21wb25lbnRzLlxuICogQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTM5NTI5MjUvMTMzMDEzODFcbiAqIEBhdXRob3Iga2FsaWNraTJLXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1Bhc2NhbENhc2UoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgJHtpbnB1dH1gXG4gICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgvWy1fXSsvLCAnZycpLCAnICcpXG4gICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgvW15cXHdcXHNdLywgJ2cnKSwgJycpXG4gICAgLnJlcGxhY2UobmV3IFJlZ0V4cCgvXFxzKyguKShcXHcrKS8sICdnJyksICgkMSwgJDIsICQzKSA9PiBgJHskMi50b1VwcGVyQ2FzZSgpICsgJDMudG9Mb3dlckNhc2UoKX1gKVxuICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoL1xccy8sICdnJyksICcnKVxuICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAoL1xcdy8pLCBzID0+IHMudG9VcHBlckNhc2UoKSlcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvcmVhZFdyaXRlLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3NyYy9saWIvdml0ZS9yZWFkV3JpdGUudHNcIjtpbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHdyaXRlRmlsZVN5bmMgfSBmcm9tICdmcydcbmltcG9ydCB7IGRpcm5hbWUsIGpvaW4gfSBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgeyBjcmVhdGVGb2xkZXJJZk5vdEV4aXN0cyB9IGZyb20gJy4vZmlsZUZvbGRlci5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWQocGF0aEZpbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiByZWFkRmlsZVN5bmMocGF0aEZpbGUsIHsgZW5jb2Rpbmc6ICd1dGY4JyB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZExpbmVzKHBhdGhGaWxlOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIHJldHVybiByZWFkKHBhdGhGaWxlKS5zcGxpdCgnXFxuJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlKHBhdGhGaWxlOiBzdHJpbmcsIGRhdGE6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gIGNvbnN0IGZ1bGxEYXRhVG9Xcml0ZSA9IEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhLmpvaW4oJ1xcbicpIDogZGF0YVxuXG4gIGNyZWF0ZUZvbGRlcklmTm90RXhpc3RzKGRpcm5hbWUocGF0aEZpbGUpKVxuXG4gIC8vIERvbid0IHdyaXRlIGlmIG5vdGhpbmcgY2hhbmdlZCFcbiAgaWYgKGV4aXN0c1N5bmMocGF0aEZpbGUpKSB7XG4gICAgY29uc3QgY3VycmVudEZpbGVEYXRhID0gcmVhZChwYXRoRmlsZSlcbiAgICBpZiAoZnVsbERhdGFUb1dyaXRlID09PSBjdXJyZW50RmlsZURhdGEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIHdyaXRlRmlsZVN5bmMoam9pbihwYXRoRmlsZSksIGZ1bGxEYXRhVG9Xcml0ZSlcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvYWN0aW9uTW9kdWxlQ29udGV4dC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvYWN0aW9uTW9kdWxlQ29udGV4dC50c1wiO2ltcG9ydCB7IGJhc2VuYW1lLCBleHRuYW1lLCBqb2luIH0gZnJvbSAncGF0aCdcblxuaW1wb3J0IHsgY3JlYXRlRm9sZGVySWZOb3RFeGlzdHMgfSBmcm9tICcuL2ZpbGVGb2xkZXIuanMnXG5pbXBvcnQgeyB0b1Bhc2NhbENhc2UgfSBmcm9tICcuL2Zvcm1hdFN0cmluZy5qcydcbmltcG9ydCB7IHdyaXRlIH0gZnJvbSAnLi9yZWFkV3JpdGUuanMnXG5cbi8vIGRsSWNodHRzR2V0QnlJZHNcbi8vIGRse0VudGl0eU5hbWV9R2V0e0Z1bmN0aW9ufXMgPT4gY3R4e0VudGl0eU5hbWV9X0RsX3tGdW5jdGlvbn1cbi8vIGN0eEljaHR0c19EbF9CeUlkXG5leHBvcnQgZnVuY3Rpb24gYWN0aW9uTW9kdWxlQ29udGV4dChcbiAgZGF0YWxvYWRlcnNNb2R1bGU6IHsgbW9kdWxlTmFtZTogc3RyaW5nOyBwcm92aWRlckZpbGU6IHN0cmluZyB9W10sIC8vIFtcImRsSWNodHRzR2V0QnlJZHNcIl1cbiAgbW9kdWxlRm9sZGVyOiBzdHJpbmcsIC8vIHNyYy9saWIvbW9kdWxlc1xuICBtb2R1bGVPdXRwdXRGb2xkZXI6IHN0cmluZywgLy8ka2l0cWxcbiAgaW1wb3J0QmFzZVR5cGVzRnJvbTogc3RyaW5nLFxuICB3aXRoRGJQcm92aWRlcjogYm9vbGVhblxuKSB7XG4gIGNvbnN0IGRhdGFDdHhNb2R1bGVzID0gW11cbiAgY29uc3QgbW9kdWxlTmFtZSA9IGJhc2VuYW1lKG1vZHVsZUZvbGRlciwgZXh0bmFtZShtb2R1bGVGb2xkZXIpKVxuXG4gIGNvbnN0IG1vZHVsZU5hbWVQYXNjYWxDYXNlID0gdG9QYXNjYWxDYXNlKG1vZHVsZU5hbWUpXG4gIGNvbnN0IGZ1bmN0aW9uc05hbWU6IHN0cmluZ1tdID0gW11cbiAgZGF0YWxvYWRlcnNNb2R1bGUuZm9yRWFjaChkYXRhbG9hZGVyID0+IHtcbiAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSBkYXRhbG9hZGVyLnByb3ZpZGVyRmlsZVxuICAgICAgLnN1YnN0cmluZyhtb2R1bGVOYW1lLmxlbmd0aCArIDIgKyAzKSAvLyArIDIgPT4gZGwgJiArIDMgPT4gR2V0XG4gICAgICAucmVwbGFjZShgcy50c2AsICcnKVxuICAgIGZ1bmN0aW9uc05hbWUucHVzaChmdW5jdGlvbk5hbWUpXG4gIH0pXG5cbiAgaWYgKHdpdGhEYlByb3ZpZGVyKSB7XG4gICAgZGF0YUN0eE1vZHVsZXMucHVzaChgaW1wb3J0IHsgbG9hZF9EYXRhTG9hZGVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vbGliL2dyYXBocWwvaGVscGVycy9kYXRhTG9hZGVySGVscGVyJztgKVxuICAgIGRhdGFDdHhNb2R1bGVzLnB1c2goYGltcG9ydCB0eXBlIHsgSUtpdFFMQ29udGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL2xpYi9ncmFwaHFsL2tpdFFMU2VydmVyJztgKVxuICAgIGlmIChmdW5jdGlvbnNOYW1lLmxlbmd0aCA+IDApIHtcbiAgICAgIGRhdGFDdHhNb2R1bGVzLnB1c2goYGltcG9ydCB0eXBlIHsgJHttb2R1bGVOYW1lUGFzY2FsQ2FzZX0gfSBmcm9tICcke2ltcG9ydEJhc2VUeXBlc0Zyb219JztgKVxuICAgIH1cbiAgICBkYXRhQ3R4TW9kdWxlcy5wdXNoKGBpbXBvcnQgeyBEYiR7bW9kdWxlTmFtZVBhc2NhbENhc2V9IH0gZnJvbSAnLi4vcHJvdmlkZXJzL0RiJHttb2R1bGVOYW1lUGFzY2FsQ2FzZX0nO2ApXG4gICAgZnVuY3Rpb25zTmFtZS5mb3JFYWNoKGZ1bmN0aW9uTmFtZSA9PiB7XG4gICAgICBkYXRhQ3R4TW9kdWxlcy5wdXNoKFxuICAgICAgICBgaW1wb3J0IHsgZGwke21vZHVsZU5hbWVQYXNjYWxDYXNlfUdldCR7ZnVuY3Rpb25OYW1lfXMgfSBmcm9tICcuLi9wcm92aWRlcnMvZGwke21vZHVsZU5hbWVQYXNjYWxDYXNlfUdldCR7ZnVuY3Rpb25OYW1lfXMnO2BcbiAgICAgIClcbiAgICB9KVxuXG4gICAgZGF0YUN0eE1vZHVsZXMucHVzaChgYClcbiAgICBkYXRhQ3R4TW9kdWxlcy5wdXNoKGBleHBvcnQgZnVuY3Rpb24gY3R4JHttb2R1bGVOYW1lUGFzY2FsQ2FzZX0oY3R4OiBJS2l0UUxDb250ZXh0KSB7YClcbiAgICBkYXRhQ3R4TW9kdWxlcy5wdXNoKGAgLy8gQHRzLWlnbm9yZWApXG4gICAgZGF0YUN0eE1vZHVsZXMucHVzaChgIHJldHVybiBjdHguaW5qZWN0b3IuZ2V0KERiJHttb2R1bGVOYW1lUGFzY2FsQ2FzZX0pIGFzIERiJHttb2R1bGVOYW1lUGFzY2FsQ2FzZX07YClcbiAgICBkYXRhQ3R4TW9kdWxlcy5wdXNoKGB9YClcbiAgICBkYXRhQ3R4TW9kdWxlcy5wdXNoKGBgKVxuICB9IGVsc2Uge1xuICAgIGRhdGFDdHhNb2R1bGVzLnB1c2goYC8vIE5vIERiUHJvdmlkZXIgZm91bmRgKVxuICAgIGRhdGFDdHhNb2R1bGVzLnB1c2goYGV4cG9ydCB7fWApXG4gIH1cblxuICBmdW5jdGlvbnNOYW1lLmZvckVhY2goZnVuY3Rpb25OYW1lID0+IHtcbiAgICBkYXRhQ3R4TW9kdWxlcy5wdXNoKFxuICAgICAgYGV4cG9ydCBhc3luYyBmdW5jdGlvbiBjdHgke21vZHVsZU5hbWVQYXNjYWxDYXNlfV9EbF8ke2Z1bmN0aW9uTmFtZX0oY3R4OiBJS2l0UUxDb250ZXh0LCBpZDogc3RyaW5nIHwgbnVtYmVyKSB7YFxuICAgIClcbiAgICBkYXRhQ3R4TW9kdWxlcy5wdXNoKGAgLy8gQHRzLWlnbm9yZWApXG4gICAgZGF0YUN0eE1vZHVsZXMucHVzaChcbiAgICAgIGBcdHJldHVybiBsb2FkX0RhdGFMb2FkZXI8JHttb2R1bGVOYW1lUGFzY2FsQ2FzZX0+KGN0eC5pbmplY3RvciwgZGwke21vZHVsZU5hbWVQYXNjYWxDYXNlfUdldCR7ZnVuY3Rpb25OYW1lfXMucHJvdmlkZSwgaWQpIGFzICR7bW9kdWxlTmFtZVBhc2NhbENhc2V9O2BcbiAgICApXG4gICAgZGF0YUN0eE1vZHVsZXMucHVzaChgfWApXG4gIH0pXG5cbiAgZGF0YUN0eE1vZHVsZXMucHVzaChgYClcblxuICBjcmVhdGVGb2xkZXJJZk5vdEV4aXN0cyhqb2luKG1vZHVsZUZvbGRlciwgbW9kdWxlT3V0cHV0Rm9sZGVyKSlcblxuICB3cml0ZShqb2luKG1vZHVsZUZvbGRlciwgbW9kdWxlT3V0cHV0Rm9sZGVyLCAnY3R4LnRzJyksIGRhdGFDdHhNb2R1bGVzKVxuXG4gIHJldHVybiBmdW5jdGlvbnNOYW1lLmxlbmd0aCArICh3aXRoRGJQcm92aWRlciA/IDEgOiAwKVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3NyYy9saWIvdml0ZS9hY3Rpb25Nb2R1bGVzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3NyYy9saWIvdml0ZS9hY3Rpb25Nb2R1bGVzLnRzXCI7aW1wb3J0IHsgam9pbiwgcG9zaXggfSBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgeyBjcmVhdGVGb2xkZXJJZk5vdEV4aXN0cyB9IGZyb20gJy4vZmlsZUZvbGRlci5qcydcbmltcG9ydCB7IHdyaXRlIH0gZnJvbSAnLi9yZWFkV3JpdGUuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhY3Rpb25Nb2R1bGVzKG1vZHVsZXM6IHsgZGlyZWN0b3J5OiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W10sIG91dHB1dEZvbGRlcjogc3RyaW5nKSB7XG4gIGNvbnN0IG1vZHVsZXNJbXBvcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGNvbnN0IG1vZHVsZXNFeHBvcnRzOiBzdHJpbmdbXSA9IFtdXG4gIGNvbnN0IGRhdGFBcHBNb2R1bGVzID0gW11cblxuICBtb2R1bGVzLmZvckVhY2gobW9kdWxlID0+IHtcbiAgICBjb25zdCBtb2R1bGVSZWxhdGl2ZVBhdGggPSBwb3NpeC5yZWxhdGl2ZShvdXRwdXRGb2xkZXIsIG1vZHVsZS5kaXJlY3RvcnkpXG4gICAgbW9kdWxlc0ltcG9ydHMucHVzaChgaW1wb3J0IHsgJHttb2R1bGUubmFtZX1Nb2R1bGUgfSBmcm9tICcke21vZHVsZVJlbGF0aXZlUGF0aH0nO2ApXG4gICAgbW9kdWxlc0V4cG9ydHMucHVzaChgICAke21vZHVsZS5uYW1lfU1vZHVsZSxgKVxuICB9KVxuXG4gIGRhdGFBcHBNb2R1bGVzLnB1c2gobW9kdWxlc0ltcG9ydHMuam9pbignXFxuJykpXG4gIGRhdGFBcHBNb2R1bGVzLnB1c2goYGApXG4gIGRhdGFBcHBNb2R1bGVzLnB1c2goYGV4cG9ydCBjb25zdCBtb2R1bGVzID0gW2ApXG4gIGRhdGFBcHBNb2R1bGVzLnB1c2gobW9kdWxlc0V4cG9ydHMuam9pbignXFxuJykpXG4gIGRhdGFBcHBNb2R1bGVzLnB1c2goYF07YClcblxuICBjcmVhdGVGb2xkZXJJZk5vdEV4aXN0cyhqb2luKG91dHB1dEZvbGRlcikpXG5cbiAgd3JpdGUoam9pbihvdXRwdXRGb2xkZXIsICdfYXBwTW9kdWxlcy50cycpLCBkYXRhQXBwTW9kdWxlcylcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvYWN0aW9uUmVzb2x2ZXJzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3NyYy9saWIvdml0ZS9hY3Rpb25SZXNvbHZlcnMudHNcIjtpbXBvcnQgeyBqb2luLCBwb3NpeCB9IGZyb20gJ3BhdGgnXG5cbmltcG9ydCB7IGNyZWF0ZUZvbGRlcklmTm90RXhpc3RzLCBnZXRGaWxlcywgZ2V0RmlsZVdPRG90cywgZ2V0RmlsZVdPVFMgfSBmcm9tICcuL2ZpbGVGb2xkZXIuanMnXG5pbXBvcnQgeyB3cml0ZSB9IGZyb20gJy4vcmVhZFdyaXRlLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aW9uUmVzb2x2ZXJzKG1vZHVsZUZvbGRlcjogc3RyaW5nLCBtb2R1bGVPdXRwdXRGb2xkZXI6IHN0cmluZykge1xuICBjb25zdCByZXNvbHZlcnNGb2xkZXIgPSAncmVzb2x2ZXJzJ1xuXG4gIGNvbnN0IHJlbGF0aXZlUmVzb2x2ZXJzRm9sZGVyID0gcG9zaXgucmVsYXRpdmUobW9kdWxlT3V0cHV0Rm9sZGVyLCByZXNvbHZlcnNGb2xkZXIpXG5cbiAgY29uc3QgcmVzb2x2ZXJzRmlsZXMgPSBnZXRGaWxlcyhqb2luKG1vZHVsZUZvbGRlciwgcmVzb2x2ZXJzRm9sZGVyKSlcbiAgY29uc3QgZGF0YVJlc29sdmVycyA9IFtdXG4gIHJlc29sdmVyc0ZpbGVzLmZvckVhY2gocmVzb2x2ZXIgPT4ge1xuICAgIGRhdGFSZXNvbHZlcnMucHVzaChcbiAgICAgIGBpbXBvcnQgeyByZXNvbHZlcnMgYXMgJHtnZXRGaWxlV09Eb3RzKHJlc29sdmVyKX0gfSBmcm9tICcke3Bvc2l4LmpvaW4oXG4gICAgICAgIHJlbGF0aXZlUmVzb2x2ZXJzRm9sZGVyLFxuICAgICAgICBnZXRGaWxlV09UUyhyZXNvbHZlcilcbiAgICAgICl9JztgXG4gICAgKVxuICB9KVxuICBkYXRhUmVzb2x2ZXJzLnB1c2goYGApXG4gIGRhdGFSZXNvbHZlcnMucHVzaChgZXhwb3J0IGNvbnN0IHJlc29sdmVycyA9IFtgKVxuICByZXNvbHZlcnNGaWxlcy5mb3JFYWNoKHJlc29sdmVyID0+IHtcbiAgICBkYXRhUmVzb2x2ZXJzLnB1c2goYCAgJHtnZXRGaWxlV09Eb3RzKHJlc29sdmVyKX0sYClcbiAgfSlcbiAgZGF0YVJlc29sdmVycy5wdXNoKGBdO2ApXG5cbiAgY3JlYXRlRm9sZGVySWZOb3RFeGlzdHMoam9pbihtb2R1bGVGb2xkZXIsIG1vZHVsZU91dHB1dEZvbGRlcikpXG5cbiAgd3JpdGUoam9pbihtb2R1bGVGb2xkZXIsIG1vZHVsZU91dHB1dEZvbGRlciwgJ3Jlc29sdmVycy50cycpLCBkYXRhUmVzb2x2ZXJzKVxuXG4gIHJldHVybiByZXNvbHZlcnNGaWxlcy5sZW5ndGhcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvYWN0aW9uVHlwZURlZnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlL2FjdGlvblR5cGVEZWZzLnRzXCI7aW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnXG5cbmltcG9ydCB7IGNyZWF0ZUZvbGRlcklmTm90RXhpc3RzLCBnZXRGaWxlcyB9IGZyb20gJy4vZmlsZUZvbGRlci5qcydcbmltcG9ydCB7IHJlYWQsIHdyaXRlIH0gZnJvbSAnLi9yZWFkV3JpdGUuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhY3Rpb25UeXBlRGVmcyhtb2R1bGVGb2xkZXI6IHN0cmluZywgbW9kdWxlT3V0cHV0Rm9sZGVyOiBzdHJpbmcsIGxvY2FsRGV2OiBib29sZWFuKSB7XG4gIGNvbnN0IHR5cGVkZWZzRm9sZGVyID0gJ3R5cGVkZWZzJ1xuXG4gIGNvbnN0IHR5cGVkZWZzRmlsZXMgPSBnZXRGaWxlcyhqb2luKG1vZHVsZUZvbGRlciwgdHlwZWRlZnNGb2xkZXIpKVxuXG4gIGNvbnN0IGRhdGFUeXBlZGVmcyA9IFtdXG4gIGlmICh0eXBlZGVmc0ZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICBkYXRhVHlwZWRlZnMucHVzaChgaW1wb3J0IHsgZ3FsIH0gZnJvbSAke2xvY2FsRGV2ID8gYCdncmFwaHFsLW1vZHVsZXMnYCA6IGAnQGtpdHFsL2FsbC1pbidgfWApXG4gICAgZGF0YVR5cGVkZWZzLnB1c2goYGApXG4gICAgZGF0YVR5cGVkZWZzLnB1c2goYGV4cG9ydCBjb25zdCB0eXBlRGVmcyA9IGdxbCR7J2AnfWApXG4gICAgdHlwZWRlZnNGaWxlcy5mb3JFYWNoKHR5cGVkZWZzID0+IHtcbiAgICAgIGRhdGFUeXBlZGVmcy5wdXNoKHJlYWQoam9pbihtb2R1bGVGb2xkZXIsIHR5cGVkZWZzRm9sZGVyLCB0eXBlZGVmcykpKVxuICAgIH0pXG4gICAgZGF0YVR5cGVkZWZzLnB1c2goYCR7J2AnfTtgKVxuICB9IGVsc2Uge1xuICAgIGRhdGFUeXBlZGVmcy5wdXNoKGAvLyBObyB0eXBlZGVmcyFgKVxuICAgIGRhdGFUeXBlZGVmcy5wdXNoKGBgKVxuICAgIGRhdGFUeXBlZGVmcy5wdXNoKGBleHBvcnQgY29uc3QgdHlwZURlZnMgPSBudWxsYClcbiAgfVxuXG4gIGNyZWF0ZUZvbGRlcklmTm90RXhpc3RzKGpvaW4obW9kdWxlRm9sZGVyLCBtb2R1bGVPdXRwdXRGb2xkZXIpKVxuXG4gIHdyaXRlKGpvaW4obW9kdWxlRm9sZGVyLCBtb2R1bGVPdXRwdXRGb2xkZXIsICd0eXBlZGVmcy50cycpLCBkYXRhVHlwZWRlZnMpXG5cbiAgcmV0dXJuIHR5cGVkZWZzRmlsZXMubGVuZ3RoXG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9ob21lL2p5Y291ZXQvdWRldi9naC9saWIva2l0cWwvcGFja2FnZXMvYWxsLWluL3NyYy9saWIvdml0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvanljb3VldC91ZGV2L2doL2xpYi9raXRxbC9wYWNrYWdlcy9hbGwtaW4vc3JjL2xpYi92aXRlL3ByaXNtYUhlbHBlci50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9qeWNvdWV0L3VkZXYvZ2gvbGliL2tpdHFsL3BhY2thZ2VzL2FsbC1pbi9zcmMvbGliL3ZpdGUvcHJpc21hSGVscGVyLnRzXCI7aW1wb3J0IHsgdG9QYXNjYWxDYXNlIH0gZnJvbSAnLi9mb3JtYXRTdHJpbmcuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmlzbWFFbnVtKGxpbmVzOiBzdHJpbmdbXSk6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiB7XG4gIGNvbnN0IGVudW1zID0ge31cblxuICBsZXQgY3VycmVudEVudW0gPSAnJ1xuICBsaW5lcy5mb3JFYWNoKChsaW5lOiBzdHJpbmcpID0+IHtcbiAgICBpZiAoY3VycmVudEVudW0gIT09ICcnKSB7XG4gICAgICBpZiAobGluZS5pbmNsdWRlcygnfScpKSB7XG4gICAgICAgIGN1cnJlbnRFbnVtID0gJydcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVudW1zW2N1cnJlbnRFbnVtXS5wdXNoKGxpbmUudHJpbSgpKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobGluZS5zdGFydHNXaXRoKCdlbnVtJykpIHtcbiAgICAgIGNvbnN0IFssIGVudW1OYW1lXSA9IGxpbmUuc3BsaXQoJyAnKVxuICAgICAgY3VycmVudEVudW0gPSB0b1Bhc2NhbENhc2UoZW51bU5hbWUpXG4gICAgICBlbnVtc1tjdXJyZW50RW51bV0gPSBbXVxuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhgbGluZWAsIGxpbmUpO1xuICB9KVxuXG4gIHJldHVybiBlbnVtc1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErVCxTQUFTLGlCQUFpQjtBQUN6VixPQUFnQzs7O0FDRDRULFNBQVMsZUFBZSxZQUFZLHdCQUF3QjtBQUN4WixPQUE4QjtBQUM5QixTQUFTLGVBQWU7QUFFeEIsT0FBTyxtQkFBbUI7OztBQ0pzVSxTQUFTLEtBQUssVUFBVSxjQUFjO0FBQ3RZLFNBQVMsWUFBQUEsV0FBVSxXQUFBQyxVQUFTLFFBQUFDLGFBQVk7OztBQ0tqQyxTQUFTLGNBQWMsWUFBdUQsY0FBc0I7QUFtQjNHOzs7QUN6Qm9XLFNBQVMsY0FBQUMsbUJBQWtCO0FBQy9YLFNBQVMsUUFBQUMsYUFBWTs7O0FDRCtVLFNBQVMsWUFBWSxXQUFXLG1CQUFtQjtBQUV2WixPQUFPLFVBQVU7QUFDakIsU0FBUyxTQUFTLFlBQVk7QUFFOUIsSUFBTSxXQUFXLFFBQVEsSUFBSTtBQUV0QixJQUFNLGlCQUFpQixDQUFDLFdBQW1CO0FBQ2hELFFBQU0sY0FBd0IsS0FDM0IsS0FBSyxNQUFNLEVBQ1gsS0FBSyxFQUNMLE9BQU8sQ0FBQyxTQUFpQixDQUFDLFFBQVEsSUFBSSxDQUFDO0FBQzFDLFNBQU87QUFDVDtBQUVPLFNBQVMsU0FBUyxRQUFnQjtBQUN2QyxNQUFJLFdBQVcsTUFBTSxHQUFHO0FBQ3RCLFdBQU8sWUFBWSxRQUFRLEVBQUUsZUFBZSxLQUFLLENB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RixHQUFHLFNBQVMsUUFBRyxjQUNULFNBQVMsS0FBSyxLQUFLLE9BQU8sY0FDM0IsU0FBUyxLQUFLLEtBQUssS0FBSyxZQUN4QixTQUFTLEtBQUssS0FBSyxRQUFRLGVBQzNCLFNBQVMsS0FBSyxLQUFLLFNBQVMsZ0JBQzVCLFNBQVMsS0FBSyxLQUFLLFFBQVE7QUFBQSxFQUNsQztBQUNGOzs7QUQ5TU8sU0FBUyxNQUFNQyxTQUE4QjtBQUNsRCxTQUFPO0FBQUEsSUFDTDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BRU4sTUFBTSxhQUFhO0FBQ2pCLGNBQU0sS0FBS0EsT0FBTTtBQUFBLE1BQ25CO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1o7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLE9BQU8sUUFBUSxvQkFBb0I7QUFBQSxRQUNuQyxLQUFLLE1BQU0sS0FBS0EsT0FBTTtBQUFBLE1BQ3hCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNGO0FBRUEsZUFBZSxLQUFLQSxTQUFvQjtBQUN0QyxNQUFJO0FBRUYsVUFBTSxVQUFVLE1BQU0sY0FBYztBQUFBLE1BQ2xDLFVBQVNBLFdBQUEsZ0JBQUFBLFFBQVEsZ0JBQWU7QUFBQSxNQUNoQyxRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsTUFDUCxTQUFTLENBQUM7QUFBQSxNQUNWLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLFlBQVk7QUFBQSxNQUNaLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFFRCxVQUFNLGlCQUFpQixPQUFPO0FBRzlCLGFBQVNBLE9BQU07QUFBQSxFQUNqQixTQUFTLEdBQVA7QUFDQSxZQUFRLE1BQU0sQ0FBQztBQUFBLEVBQ2pCO0FBQ0Y7OztBRDFDQSxJQUFNLFNBQXFCO0FBQUEsRUFDekIsU0FBUyxDQUFDLE1BQU0sRUFBRSxhQUFhLFNBQVMsVUFBVSxLQUFLLENBQUMsR0FBRyxVQUFVLENBQUM7QUFBQSxFQUV0RSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsdUJBQXVCO0FBQUEsRUFDbkM7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFROyIsCiAgIm5hbWVzIjogWyJiYXNlbmFtZSIsICJleHRuYW1lIiwgImpvaW4iLCAiZXhpc3RzU3luYyIsICJqb2luIiwgImV4aXN0c1N5bmMiLCAiam9pbiIsICJleGlzdHNTeW5jIiwgImpvaW4iLCAiam9pbiIsICJlbnVtRmlsZURhdGEiLCAiZXhpc3RzU3luYyIsICJleHRuYW1lIiwgImpvaW4iLCAiZXh0bmFtZSIsICJqb2luIiwgImpvaW4iLCAiam9pbiIsICJqb2luIiwgInBvc2l4IiwgInBvc2l4IiwgImpvaW4iLCAiam9pbiIsICJqb2luIiwgImNvbmZpZyIsICJiYXNlbmFtZSIsICJleHRuYW1lIiwgImpvaW4iLCAiY29uZmlnIl0KfQo=
