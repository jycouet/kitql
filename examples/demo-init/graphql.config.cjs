const scalars = {
	Date: '../helpers/scalarTypes#CodegenDate',
	DateTime: 'Date'
};

/** @type {import('@kitql/all-in').KitQLProjects} */
const config = {
	projects: {
		init: kitQLConfig('./', scalars)
	}
};

module.exports = config;
