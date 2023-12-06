<script lang="ts">
  import { page } from '$app/stores'
  import { route } from '$lib/ROUTES.js'

  const siteId = 'Paris'
  const contractId = 'abc'

  const getLang = (lang?: string) => {
    if (lang === 'fr' || lang === 'hu') {
      return lang as 'fr' | 'hu'
    }
    return 'fr'
  }

  // Example : route()
  // console.log(`dd`, route('/subGroup2', { first: 2 }))
  // console.log(`dd`, route('/'))
  // console.log(
  //   `dd`,
  //   route('send /site_contract/[siteId]-[contractId]', { siteId: 'Paris', contractId: 'abc' }),
  // )
</script>

<svelte:head>
  <title>Kit Routes</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>
  <img width={40} height={40} alt="logo" src="/favicon.png" />
  vite-plugin-kit-routes <em>({$page.params.lang ?? 'lang??'})</em>
</h1>
<pre>{JSON.stringify($page.route.id, null, 2)}</pre>
<hr />

<ul>
  <li><a href={route('/')}>Home</a></li>
  <li>
    <a href={route('/site', { lang: $page.params.lang })}>Sites</a> |
    <a href={route('/site', { lang: $page.params.lang, limit: 2 })}>Sites (with Search Param)</a>
  </li>
  <li>
    <a href={route('/site/[id]', { lang: getLang($page.params.lang), id: 'Paris' })}>Site Paris</a>
  </li>
  <li>
    <!-- 🤞 before, hardcoded string, error prone -->
    <a
      href="{$page.params.lang
        ? `/${$page.params.lang}`
        : ''}/site_contract/{siteId}-{contractId}?limit={3}">Go to site & Contrat</a
    >
    |
    <!-- ✅ after, typechecked route, no more errors -->
    <a
      href={route('/site_contract/[siteId]-[contractId]', {
        lang: $page.params.lang,
        siteId,
        contractId,
        limit: 3,
      })}>Go to site & Contrat</a
    >
  </li>
  <li>
    <a href={route('/match/[id=int]', { lang: $page.params.lang, id: 1 })}>match int 1</a> |
    <a href={route('/match/[id=ab]', { lang: $page.params.lang, id: 'a' })}>match int a</a>
    <!--
      We can't do this because the type is not good
      <a href={PAGES.match_id_int({ lang: $page.params.lang, id: 'c' })}>match int c (expect 404)</a> -->
  </li>
  <li>
    <a href={route('/gp/one', { lang: $page.params.lang })}>gp One</a>
  </li>
  <li>
    <a href={route('/gp/two', { lang: $page.params.lang })}>gp Two</a>
  </li>
  <li>
    <a href={route('/a/[...rest]/z', { rest: ['SWAGER', 'GRAPHIQL'] })}>Rest SWAGER GRAPHIQL</a>
  </li>
  <li>
    <a href={route('/lay/normal')}>Layout Normal</a> |
    <a href={route('/lay/root-layout')}>Layout Root</a> |
    <a href={route('/lay/skip')}>Layout Skip</a>
  </li>
  <li>
    <a href={route('/sp')}>Search Params</a>
  </li>
</ul>

<hr />

<span> LINKS: </span>
<a href={route('twitter')} target="_blank">TwiX</a> |
<a href={route('twitter_post', { name: 'jycouet', id: '1727089217707159569' })} target="_blank">
  TwiX Post
</a>
|
<img alt="CORS issue?" src={route('gravatar', { str: 'jycouet', s: 50 })} />
<hr />

<slot />

<hr />

<div class="text-right">
  <a href="https://github.com/jycouet/kitql" target="_blank"> ⭐️ KitQL 🙏 </a>
</div>

<style>
  .text-right {
    text-align: right;
  }
</style>
