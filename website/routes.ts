import { IRoutes, GenerateRoutes } from '@guild-docs/server';

export function getRoutes(): IRoutes {
	let Routes: IRoutes = {};

	GenerateRoutes({
		Routes,
		folderPattern: 'docs',
		basePath: 'docs',
		basePathLabel: 'I WILL NEVER SEE YOU AGAIN!!!'
	});

	return transformBasePath(Routes);
}

function transformBasePath(r: IRoutes) {
	let levelRoute: IRoutes = {};
	if (r._) {
		for (const folder in r._) {
			levelRoute.$name = folder;
			levelRoute.$routes = r._[folder].$routes?.map(([path, label, title]) => {
				return [`${folder}/${path}`, label ?? '???', title];
			});
			const newSubLevel = transformBasePath(r._[folder]);
			if (newSubLevel.$name) {
				levelRoute['_'] = { [folder]: newSubLevel };
			}
		}
	}
	return levelRoute;
}
