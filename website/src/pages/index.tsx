import { HeroGradient, InfoList } from '@theguild/components'

import { handlePushRoute, NPMBadge } from '@guild-docs/client'

export default function Index() {
  return (
    <>
      <HeroGradient
        title="Time to ease data management"
        description="SvelteKit gives all building blocks to build Svelte Apps. KitQL brings the data management layer."
        link={{
          href: '/docs',
          children: 'Documentation',
          title: 'Get started with KitQL Docs',
          onClick: e => handlePushRoute('/docs/README', e),
        }}
        version={<NPMBadge name="@kitql/all-in" />}
        colors={['#000000', '#ff3e00']}
        image={{ src: '/assets/houdini-kitql.png', alt: 'KitQL' }}
      />
      <InfoList
        items={[
          {
            title: 'SvelteKit',
            description: 'THE FASTEST WAY TO BUILD SVELTE APPS.',
            link: { title: 'SvelteKit', href: 'https://kit.svelte.dev/' },
          },
          {
            title: 'Everything you need to build a GraphQL Endpoint',
            description:
              'All tools combined to scale with GraphQL: Yoga, Envelop, Modules, Scalars, CodeGen, GraphQL-eslint, and more!',
            link: { title: 'The Guild Ecosystem', href: 'https://the-guild.dev/open-source' },
          },
          {
            title: 'Hand in hand with Houdini',
            description: 'The best way to interact with KitQL endpoint is to use Houdini Client.',
            link: { title: "Houdini's Docs", href: 'https://www.houdinigraphql.com/' },
          },
        ]}
      />
    </>
  )
}
