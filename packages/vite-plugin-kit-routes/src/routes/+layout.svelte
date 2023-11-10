<script lang="ts">
  import { afterNavigate } from '$app/navigation'
  import { page } from '$app/stores'
  import { PAGES } from '$lib/ROUTES.js'
  import { kitRoutes } from '$lib/uu.js'

  const siteId = 'Paris'
  const contractId = 'abc'

  afterNavigate(() => {
    kitRoutes.update({ lang: $page.params.lang })
    console.log(`$kitRoutes`, $kitRoutes)
  })
</script>

<svelte:head>
  <title>Kit Routes</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>vite-plugin-kit-routes <em>({$page.params.lang ?? 'lang??'})</em></h1>
{JSON.stringify($page.route.id, null, 2)}
<hr />

<ul>
  <li><a href={PAGES.lang().href}>Home</a></li>
  <li><a href={PAGES.lang_site().href}>Sites</a></li>
  <li><a href={PAGES.lang_site({ limit: 2 }).href}>Sites (with Search Param)</a></li>
  <li><a href={PAGES.lang_site_id({ id: 'Paris' }).href}>Site Paris</a></li>
  <li>
    <!-- 🤞 before, random string -->
    <a href="/site_contract/{siteId}-{contractId}?limit={3}">Go to site</a>
    |
    <!-- ✅ after, all typed & make sure it exist. // 'vite-plugin-kit-routes', -->
    <a href={PAGES.lang_site_contract_siteId_contractId({ siteId, contractId, limit: 3 }).href}
      >Go to site</a
    >
  </li>
  <li>
    <a href={PAGES.lang_match_id_int({ id: 1 }).href}>match int 1</a>
  </li>
  <li>
    <a href={PAGES.lang_match_id_int({ id: 'a' }).href}>match int a (expect 404)</a>
  </li>
  <li>
    <a href={PAGES.lang_gp_logged_one().href}>gp One</a>
  </li>
  <li>
    <a href="/gp/two">gp Two</a>
  </li>
</ul>

<hr />

<slot />
