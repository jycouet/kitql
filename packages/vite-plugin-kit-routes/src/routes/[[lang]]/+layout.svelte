<script lang="ts">
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/stores'
  import { kitRoutes, PAGES, type StorageParams } from '$lib/ROUTES.js'

  const siteId = 'Paris'
  const contractId = 'abc'

  // For SSR
  kitRoutes.update({ lang: $page.params.lang as StorageParams['lang'] })

  afterNavigate(() => {
    // For CSR update the lang
    kitRoutes.update({ lang: $page.params.lang as StorageParams['lang'] })
    // console.log(`$kitRoutes`, $kitRoutes)
  })
</script>

<svelte:head>
  <title>Kit Routes</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>
  vite-plugin-kit-routes <em>({$page.params.lang ?? 'lang??'}) ({$kitRoutes.lang ?? 'lang??'})</em>
</h1>
<pre>{JSON.stringify($page.route.id, null, 2)}</pre>
<hr />

<ul>
  <li><a href={PAGES.lang({ lang: $kitRoutes.lang })}>Home</a></li>
  <li><a href={PAGES.lang_site({ lang: $kitRoutes.lang })}>Sites</a></li>
  <li>
    <a href={PAGES.lang_site({ lang: $kitRoutes.lang, limit: 2 })}>Sites (with Search Param)</a
    >
  </li>
  <li><a href={PAGES.lang_site_id({ lang: $kitRoutes.lang, id: 'Paris' })}>Site Paris</a></li>
  <li>
    <!-- 🤞 before, random string -->
    <a
      href="{$kitRoutes.lang
        ? `/${$kitRoutes.lang}`
        : ''}/site_contract/{siteId}-{contractId}?limit={3}">Go to site</a
    >
    |
    <!-- ✅ after, all typed & make sure it exist. // 'vite-plugin-kit-routes', -->
    <a
      href={PAGES.lang_site_contract_siteId_contractId({
        lang: $kitRoutes.lang,
        siteId,
        contractId,
        limit: 3,
      })}>Go to site</a
    >
  </li>
  <li>
    <a href={PAGES.lang_match_id_int({ lang: $kitRoutes.lang, id: 1 })}>match int 1</a>
  </li>
  <li>
    <a href={PAGES.lang_match_id_int({ lang: $kitRoutes.lang, id: 'a' })}
      >match int a (expect 404)</a
    >
  </li>
  <li>
    <a href={PAGES.lang_gp_logged_one({ lang: $kitRoutes.lang })}>gp One</a>
  </li>
  <li>
    <a href={PAGES.lang_gp_public_two({ lang: $kitRoutes.lang })}>gp One</a>
  </li>
</ul>

<hr />

<slot />
