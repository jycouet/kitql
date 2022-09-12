import { AppProps } from 'next/app'
import { FooterExtended, Header, ThemeProvider } from '@theguild/components'
import 'guild-docs/style.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Header accentColor="#ff3e00" themeSwitch searchBarProps={{ version: 'v2' }} />
      <Component {...pageProps} />
      <FooterExtended />
    </ThemeProvider>
  )
}

// const defaultSeo: AppSeoProps = {
//   title: 'KitQL',
//   description: 'Fully featured GraphQL ecosystem in SvelteKit',
//   logo: {
//     url: 'https://www.kitql.dev/banner.svg',
//     width: 200,
//     height: 350,
//   },
//   openGraph: {
//     images: [
//       {
//         url: 'https://www.kitql.dev/cover.png',
//         width: 1280,
//         height: 720,
//       },
//     ],
//   },
// }
