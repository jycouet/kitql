import { FeatureList, HeroGradient, NPMBadge } from '@theguild/components'

import houdini_kitql from '../../public/assets/houdini-kitql.png'
import graphql from '../../public/assets/logos/graphql.png'
import houdini from '../../public/assets/logos/houdini.png'
import svelte from '../../public/assets/logos/svelte.png'

export function IndexPage() {
  return (
    <>
      <HeroGradient
        title="Time to Ease Data Management"
        description="KitQL brings data management layer to SvelteKit"
        link={{
          href: '/docs',
          children: 'Get Started',
          title: 'Learn more about KitQL',
        }}
        version={<NPMBadge name="@kitql/all-in" />}
        colors={['#000000', '#ff3e00']}
        image={{
          src: houdini_kitql,
          alt: 'Illustration',
          width: 300,
          height: 300,
        }}
      />
      <FeatureList
        title="What Is KitQL?"
        items={[
          {
            image: {
              className: 'w-24 h-24',
              alt: 'SvelteKit',
              src: svelte,
            },
            title: 'SvelteKit',
            description: 'Enables composition of modules into Svelte apps.',
          },
          {
            image: {
              className: 'w-24 h-24',
              alt: 'GraphQL',
              src: graphql,
            },
            title: 'GraphQL',
            description: 'Brings the powerful GraphQL endpoint ecosystem to SvelteKit.',
          },
          {
            image: {
              className: 'w-24 h-24',
              alt: 'Houdini',
              src: houdini,
            },
            title: 'Houdini',
            description: 'Display your data in your browser in an easy manner.',
          },
        ]}
      />
    </>
  )
}
