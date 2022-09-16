import { createRequire } from 'node:module'
import nextBundleAnalyzer from '@next/bundle-analyzer'
import { withGuildDocs } from '@guild-docs/server'
import { register } from 'esbuild-register/dist/node.js'
import { i18n } from './next-i18next.config.js'

register({ extensions: ['.ts', '.tsx'] })

const require = createRequire(import.meta.url)

const { getRoutes } = require('./routes.ts')

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})
export default withBundleAnalyzer(
  withGuildDocs({
    i18n,
    getRoutes,
    redirects: () => {
      return []
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  })
)
