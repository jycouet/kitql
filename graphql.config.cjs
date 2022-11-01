const kitQLConfig = require('./packages/all-in/dist/cjs.cjs')

const scalars = {
  Date: '../helpers/scalarTypes#CodegenDate',
  DateTime: 'Date',
}

/** @type {import('@kitql/all-in').KitQLProjects} */
const config = {
  projects: {
    init: kitQLConfig({ scalars, projectLocation: './packages/all-in' }),
  },
}

module.exports = config
