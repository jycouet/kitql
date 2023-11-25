<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'
  import { LINKS, PAGES } from '$lib/ROUTES.js'

  const siteId = 'Paris'
  const contractId = 'abc'

  const getLang = (lang?: string) => {
    if (lang === 'fr' || lang === 'hu') {
      return lang as 'fr' | 'hu'
    }
    return 'fr'
  }
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
  <li><a href={PAGES._ROOT}>Home</a></li>
  <li><a href={PAGES.lang_site({ lang: $page.params.lang })}>Sites</a></li>
  <li>
    <a href={PAGES.lang_site({ lang: $page.params.lang, limit: 2 })}>Sites (with Search Param)</a>
  </li>
  <li>
    <a href={PAGES.lang_site_id({ lang: getLang($page.params.lang), id: 'Paris' })}>Site Paris</a>
  </li>
  <li>
    <!-- 🤞 before, hardcoded string, error prone -->
    <a
      href="{$page.params.lang
        ? `/${$page.params.lang}`
        : ''}/site_contract/{siteId}-{contractId}?limit={3}">Go to site</a
    >
    |
    <!-- ✅ after, typechecked route, no more errors -->
    <a
      href={PAGES.lang_site_contract_siteId_contractId({
        lang: $page.params.lang,
        siteId,
        contractId,
        limit: 3,
      })}>Go to site</a
    >
  </li>
  <li>
    <a href={PAGES.lang_match_id_int({ lang: $page.params.lang, id: 1 })}>match int 1</a>
  </li>
  <li>
    <a href={PAGES.lang_match_id_int({ lang: $page.params.lang, id: 'a' })}
      >match int a (expect 404)</a
    >
  </li>
  <li>
    <a href={PAGES.lang_gp_one({ lang: $page.params.lang })}>gp One</a>
  </li>
  <li>
    <a href={PAGES.lang_gp_two({ lang: $page.params.lang })}>gp Two</a>
  </li>
  <li>
    <a href={PAGES.a_rest_z({ rest: ['SWAGER', 'GRAPHIQL'] })}>Rest SWAGER GRAPHIQL</a>
  </li>
  <li>
    <a href={PAGES.lay_normal}>Layout Normal</a> |
    <a href={PAGES.lay_root_layout}>Layout Root</a> |
    <a href={PAGES.lay_skip}>Layout Skip</a>
  </li>
</ul>

<hr />

<span> LINKS: </span>
<a href={LINKS.twitter} target="_blank">TwiX</a> |
<a href={LINKS.twitter_post({ name: 'jycouet', id: '1727089217707159569' })} target="_blank">
  TwiX Post
</a>
|
<img alt="CORS issue?" src={LINKS.gravatar({ str: 'jycouet', s: 50 })} />
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
