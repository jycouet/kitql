import { HeroGradient, HeroIllustration } from '@theguild/components'
import { IHeroIllustrationProps } from '@theguild/components/dist/types/components'

export const ITEMS: IHeroIllustrationProps[] = [
  {
    title: 'Everything you need to build a GraphQL Endpoint',
    description:
      'All tools combined to scale with GraphQL: Yoga, Envelop, Modules, Scalars, CodeGen, GraphQL-eslint, and more!',
    image: {
      src: 'https://raw.githubusercontent.com/dotansimha/graphql-yoga/master/website/public/assets/yogaHome.svg',
      placeholder: 'empty',
      alt: 'Ecosystem',
      width: 200,
      height: 200,
    },
    flipped: true,
    link: {
      children: 'The Guild Ecosystem',
      title: 'The Guild Ecosystem',
      href: 'https://the-guild.dev/open-source',
    },
  },
  {
    title: 'Hand in hand with Houdini',
    description: 'Works perfectly with Houdini client.',
    image: {
      src: '/assets/houdini-kitql.png',
      placeholder: 'empty',
      alt: 'Houdini and KitQL',
      width: 200,
      height: 200,
    },
    link: {
      children: "Houdini's Docs",
      title: "Houdini's Docs",
      href: 'https://www.houdinigraphql.com/',
    },
  },
]

export default function IndexPage() {
  return (
    <>
      <HeroGradient
        title="Time to ease data management"
        description="SvelteKit gives all building blocks to build Svelte Apps. KitQL brings the data management layer."
        link={[
          {
            href: '/docs',
            children: 'Read the docs',
            title: 'Read the Docs',
          },
        ]}
        colors={['#000000', '#ff3e00']}
        image={{
          src: 'https://raw.githubusercontent.com/jycouet/kitql/main/logo.svg',
          placeholder: 'empty',
          alt: 'KitQL Logo',
          width: 200,
          height: 200,
        }}
      />
      {ITEMS.map(option => (
        <HeroIllustration
          key={option.title as string}
          {...option}
          image={{
            ...option.image,
            className: 'h-52 md:h-72',
          }}
        />
      ))}
    </>
  )
}
