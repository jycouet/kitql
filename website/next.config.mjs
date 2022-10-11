import { withGuildDocs } from '@theguild/components/next.config'

export default withGuildDocs({
  images: {
    unoptimized: true,
  },
  experimental: {
    urlImports: ['https://the-guild.dev/static/shared-logos/products/hive.svg'],
  },
  redirects: () =>
    Object.entries({}).map(([from, to]) => ({
      source: from,
      destination: to,
      permanent: true,
    })),
})
