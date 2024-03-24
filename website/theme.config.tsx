import { defineConfig, PRODUCTS, useConfig } from '@theguild/components'

const SITE_NAME = 'KitQL'
const SITE_DESCRIPTION = 'A set of standalone tools to SpeedRun WebApps!'
const SOCIAL_IMAGE_URL =
  'https://raw.githubusercontent.com/jycouet/kitql/main/website/public/assets/social-kitql.png'

export default defineConfig({
  websiteName: SITE_NAME,
  description: PRODUCTS.KITQL.title,
  docsRepositoryBase: 'https://github.com/jycouet/kitql/tree/main/website',
  head: () => {
    const config = useConfig<{ description?: string; image?: string }>()
    const title =
      config.title.toLocaleLowerCase() === 'index' ? SITE_NAME : `${config.title} | ${SITE_NAME}`

    return (
      <>
        <title>{title}</title>

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={`${SITE_NAME}: ${SITE_DESCRIPTION}`} />

        <meta property="og:url" content="https://www.kitql.dev" />
        <meta property="og:type" content="website" />
        <meta name="og:title" content={`${SITE_NAME}: Documentation`} />
        <meta property="og:description" content={`${SITE_NAME}: ${SITE_DESCRIPTION}`} />
        <meta property="og:image" content={SOCIAL_IMAGE_URL} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="kitql.dev" />
        <meta property="twitter:url" content="https://www.kitql.dev" />
        <meta name="twitter:title" content={`${SITE_NAME}: Documentation`} />
        <meta name="twitter:description" content={`${SITE_NAME}: ${SITE_DESCRIPTION}`} />
        <meta name="twitter:image" content={SOCIAL_IMAGE_URL} />
      </>
    )
  },
  logo: PRODUCTS.KITQL.logo({ className: 'w-9' }),
})
