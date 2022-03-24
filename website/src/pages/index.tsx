import { HeroGradient, InfoList } from '@theguild/components';

import { handlePushRoute, NPMBadge } from '@guild-docs/client';

export default function Index() {
	return (
		<>
			<HeroGradient
				title="KitQL Docs"
				description="A set of tools, helping you building efficient apps in a fast way."
				link={{
					href: '/docs',
					children: 'Documentation',
					title: 'Get started with KitQL Docs',
					onClick: (e) => handlePushRoute('/docs/README', e)
				}}
				version={<NPMBadge name="@kitql/all-in" />}
				colors={['#000000', '#ff3e00']}
			/>
			<InfoList
				items={[
					{
						title: 'Early Stage',
						description:
							'The idea is to put the glue between all 🧡 tools from awesome communities. Come and join us to build this together.'
					},
					{
						title: '#SvelteKit',
						description: 'THE FASTEST WAY TO BUILD SVELTE APPS.'
					},
					{
						title: '#GraphQL',
						description: 'A query language for your API.'
					}
				]}
			/>
		</>
	);
}
