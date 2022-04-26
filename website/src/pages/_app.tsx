import 'remark-admonitions/styles/infima.css';
import '../../public/style.css';

import { appWithTranslation } from 'next-i18next';

import { extendTheme, theme as chakraTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import {
	ExtendComponents,
	handlePushRoute,
	CombinedThemeProvider,
	DocsPage,
	AppSeoProps
} from '@guild-docs/client';
import { Header, Subheader, Footer } from '@theguild/components';

import type { AppProps } from 'next/app';

ExtendComponents({
	HelloWorld() {
		return <p>Hello World!</p>;
	}
});

const styles: typeof chakraTheme['styles'] = {
	global: (props) => ({
		body: {
			bg: mode('white', 'gray.850')(props)
		}
	})
};

const accentColor = '#ff3e00';

const theme = extendTheme({
	colors: {
		gray: {
			50: '#fafafa',
			100: '#f5f5f5',
			200: '#e5e5e5',
			300: '#d4d4d4',
			400: '#a3a3a3',
			500: '#737373',
			600: '#525252',
			700: '#404040',
			800: '#262626',
			850: '#1b1b1b',
			900: '#171717'
		},
		accentColor
	},
	fonts: {
		heading: 'TGCFont, sans-serif',
		body: 'TGCFont, sans-serif'
	},
	config: {
		initialColorMode: 'light',
		useSystemColorMode: false
	},
	styles
});

const serializedMdx = process.env.SERIALIZED_MDX_ROUTES;
const mdxRoutes = { data: serializedMdx && JSON.parse(serializedMdx) };

function AppContent(appProps: AppProps) {
	const { Component, pageProps, router } = appProps;
	const isDocs = router.asPath.startsWith('/docs');

	return (
		<>
			<Header accentColor={accentColor} activeLink="/open-source" themeSwitch />
			<Subheader
				activeLink={router.asPath}
				product={{
					title: 'KitQL Docs',
					description: 'A set of tools, helping you building efficient apps in a fast way.',
					image: {
						src: '/assets/subheader-logo.svg',
						alt: 'Docs'
					},
					onClick: (e) => handlePushRoute('/', e)
				}}
				links={[
					// {
					// 	children: 'Home',
					// 	title: 'HOME',
					// 	href: '/',
					// 	onClick: (e) => handlePushRoute('/', e)
					// },
					{
						children: 'Github',
						title: 'Github',
						href: 'https://github.com/jycouet/kitql',
						target: '_blank',
						rel: 'noopener noreferrer'
					}
				]}
				cta={{
					children: 'Documentation',
					title: 'GETSTARTED',
					href: '/docs/README',
					onClick: (e) => handlePushRoute('/docs/README', e)
				}}
			/>
			{isDocs ? (
				<DocsPage appProps={appProps} accentColor={accentColor} mdxRoutes={mdxRoutes} />
			) : (
				<Component {...pageProps} />
			)}
			<Footer />
		</>
	);
}

const AppContentWrapper = appWithTranslation(function TranslatedApp(appProps) {
	return <AppContent {...appProps} />;
});

const defaultSeo: AppSeoProps = {
	title: 'KitQL',
	description: 'KitQL Docs',
	logo: {
		url: 'https://raw.githubusercontent.com/jycouet/kitql/main/logo.png',
		width: 50,
		height: 54
	}
};

export default function App(appProps: AppProps) {
	return (
		<CombinedThemeProvider theme={theme} accentColor={accentColor} defaultSeo={defaultSeo}>
			<AppContentWrapper {...appProps} />
		</CombinedThemeProvider>
	);
}
