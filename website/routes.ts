import { IRoutes, GenerateRoutes } from '@guild-docs/server'

export function getRoutes(): IRoutes {
  const Routes: IRoutes = {
    _: {
      README: {
        $name: 'Introduction',
      },
      'all-in': {
        $name: 'Get started',
      },
      usages: {
        $name: 'Usages',
        $routes: ['queries', 'mutations', 'patch', 'tips'],
      },
      demos: {
        $name: 'Demos',
        $routes: ['01_demo-01', '02_demo-github-social-preview', '03_demo-02'],
      },
      setup: {
        $name: 'Package by package',
        $routes: ['01_graphql-codegen', '02_client', '03_vite-plugin-watch-and-run'],
      },
    },
  }

  GenerateRoutes({
    Routes,
    folderPattern: 'docs',
    // ignorePaths: ['setup']
  })

  return {
    _: Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Object.entries(Routes._).map(([key, value]) => [`docs/${key}`, value])
    ),
  }

  // GenerateRoutes({
  // 	Routes,
  // 	folderPattern: 'docs',
  // 	basePath: 'docs',
  // 	basePathLabel: 'Documentation'
  // });

  return Routes
}
