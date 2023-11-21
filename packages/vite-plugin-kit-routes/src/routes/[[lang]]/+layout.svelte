<script lang="ts">
  import { page } from '$app/stores'
  import { PAGES } from '$lib/ROUTES.js'

  const siteId = 'Paris'
  const contractId = 'abc'
</script>

<svelte:head>
  <title>Kit Routes</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>
  vite-plugin-kit-routes <em>({$page.params.lang ?? 'lang??'})</em>
</h1>
<pre>{JSON.stringify($page.route.id, null, 2)}</pre>
<hr />

<ul>
  <li><a href={PAGES.lang({ lang: $page.params.lang })}>Home</a></li>
  <li><a href={PAGES.lang_site({ lang: $page.params.lang })}>Sites</a></li>
  <li>
    <a href={PAGES.lang_site({ lang: $page.params.lang, limit: 2 })}>Sites (with Search Param)</a>
  </li>
  <li><a href={PAGES.lang_site_id({ lang: $page.params.lang, id: 'Paris' })}>Site Paris</a></li>
  <li>
    <!-- 🤞 before, random string -->
    <a
      href="{$page.params.lang
        ? `/${$page.params.lang}`
        : ''}/site_contract/{siteId}-{contractId}?limit={3}">Go to site</a
    >
    |
    <!-- ✅ after, all typed & make sure it exist. // 'vite-plugin-kit-routes', -->
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
    <a href={PAGES.lang_gp_logged_one({ lang: $page.params.lang })}>gp One</a>
  </li>
  <li>
    <a href={PAGES.lang_gp_public_two({ lang: $page.params.lang })}>gp One</a>
  </li>
</ul>

<hr />

<slot />
