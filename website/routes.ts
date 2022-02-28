import { IRoutes, GenerateRoutes } from '@guild-docs/server';

export function getRoutes(): IRoutes {
	const Routes: IRoutes = {
		_: {}
	};

	GenerateRoutes({
		Routes,
		folderPattern: 'docs',
		basePath: 'docs',
		basePathLabel: 'KitQL'
	});

	return Routes;
}
