import { IRoutes, GenerateRoutes } from '@guild-docs/server';

export function getRoutes(): IRoutes {
	const Routes: IRoutes = {
		_: {
			// index: {
			// 	$name: 'Getting started',
			// 	$routes: ['README']
			// 	// $name: 'Home',
			// 	// $routes: [['index', 'Home Page']]
			// }
			// docs: {
			// 	$name: 'Docs',
			// 	$routes: ['README']
			// }
		}
	};
	GenerateRoutes({
		Routes,
		folderPattern: 'docs',
		basePath: 'docs',
		basePathLabel: 'Documentation'
	});

	return Routes;
	// return {
	// 	...Routes,
	// 	_: Object.fromEntries(
	// 		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// 		// @ts-ignore
	// 		Object.entries(Routes._).map(([key, value]) => [`docs/${key}`, value])
	// 	)
	// };
}
