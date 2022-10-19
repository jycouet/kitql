// I have to make it better one day!
const kitQLConfig = require('@kitql/all-in/graphql/cjs/graphqlConfigCJS.cjs');

const scalars = {
	Date: '../helpers/scalarTypes#CodegenDate',
	DateTime: 'Date'
};

/** @type {import('@kitql/all-in').KitQLProjects} */
const config = {
	projects: {
		init: kitQLConfig({ scalars })
	}
};

module.exports = config;
