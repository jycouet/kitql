import { resolve } from 'node:path'
import { indexToAlgolia } from '@theguild/algolia'

const CWD = process.cwd()

indexToAlgolia({
  nextra: {
    docsBaseDir: resolve(CWD, 'src/pages'),
  },
  source: 'KitQL',
  dryMode: process.env.ALGOLIA_DRY_RUN === 'true',
  domain: 'https://www.kitql.dev/',
  lockfilePath: resolve(CWD, 'algolia-lockfile.json'),
})
