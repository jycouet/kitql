const kitqlConfig = require('./packages/all-in/src/lib/cjs.cjs')

const scalars = {
  Date: '../helpers/scalarTypes#CodegenDate',
  DateTime: 'Date',
}

/** @type {import('@kitql/all-in').KitQLProjects} */
const config = {
  projects: {
    myPrj: kitqlConfig({ scalars, projectLocation: './packages/all-in' }),
  },
}

module.exports = config
