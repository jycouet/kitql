import { resolve } from 'node:path'
import { indexToAlgolia } from '@guild-docs/algolia'

const CWD = process.cwd()

indexToAlgolia({
  nextra: {
    docsBaseDir: resolve(CWD, 'src/pages/'),
  },
  // routes: [getRoutes(), getTutorialRoutes()],
  // domain: process.env.SITE_URL,
  source: 'KitQL',
  domain: 'https://www.kitql.dev/',
  lockfilePath: resolve(CWD, 'algolia-lockfile.json'),
  dryMode: process.env.ALGOLIA_DRY_RUN === 'true',
})
