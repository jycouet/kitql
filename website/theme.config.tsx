import { KitQLLogo, defineConfig } from '@theguild/components'

const SITE_NAME = 'KitQL'

export default defineConfig({
  titleSuffix: ` – ${SITE_NAME}`,
  docsRepositoryBase: 'https://github.com/jycouet/kitql/tree/main/website',
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={`${SITE_NAME}: documentation`} />
      <meta name="og:title" content={`${SITE_NAME}: documentation`} />
    </>
  ),
  logo: (
    <>
      <KitQLLogo className="mr-1.5 h-9 w-9" />
      <h1 className="md:text-md text-sm font-medium">{SITE_NAME}</h1>
    </>
  ),
})

// const defaultSeo: AppSeoProps = {
//   title: 'KitQL',
//   description: 'A GraphQL plugin system for improved developer experience.',
//   logo: {
//     url: 'https://repository-images.githubusercontent.com/451914608/c7134472-769a-4d56-9380-bf66d3363196',
//   },
// };
