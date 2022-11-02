import { KitQLLogo, defineConfig } from '@theguild/components'

const SITE_NAME = 'KitQL'
const SITE_DESCRIPTION = 'Bring data management layer to SvelteKit'
const SOCIAL_IMAGE_URL = 'https://raw.githubusercontent.com/jycouet/kitql/main/website/public/assets/social-kitql.png'

export default defineConfig({
  siteName: SITE_NAME,
  docsRepositoryBase: 'https://github.com/jycouet/kitql/tree/main/website',
  head: (
    <>
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
  ),
  logo: (
    <>
      <KitQLLogo className="mr-1.5 h-9 w-9" />
      <h1 className="md:text-md text-sm font-medium">{SITE_NAME}</h1>
    </>
  ),
})
