import { IRoutes, GenerateRoutes } from '@guild-docs/server';

export function getRoutes(): IRoutes {
	const Routes: IRoutes = {};

	GenerateRoutes({
		Routes,
		folderPattern: 'docs',
		basePath: 'docs',
		basePathLabel: 'Documentation'
	});

	return Routes;
}
