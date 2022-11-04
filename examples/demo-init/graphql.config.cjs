// I have to make it better one day!
const kitqlConfig = require('@kitql/all-in/cjs.cjs');

const scalars = {
	Date: '../helpers/scalarTypes#CodegenDate',
	DateTime: 'Date'
};

/** @type {import('@kitql/all-in').KitQLProjects} */
const config = {
	projects: {
		init: kitqlConfig({ scalars })
	}
};

module.exports = config;
