<script lang="ts">
  import { PAGES } from '$lib/ROUTES.js'
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>vite-plugin-kit-routes</h1>

<hr />

<ul>
  <li><a href={PAGES._ROOT()}>Home</a></li>
  <li><a href={PAGES.site()}>Sites</a></li>
  <li><a href={PAGES.site({ limit: 2 })}>Sites (with Search Param)</a></li>
  <li><a href={PAGES.site_id({ id: 'Paris' })}>Site Paris</a></li>
  <li>
    <a href={PAGES.site_contract_siteId_contractId({ siteId: 'Paris', contractId: 'First' })}>
      Site Paris & Contract First
    </a>
  </li>
  <li>
    <a href={PAGES.lang_lang()}>Lang ??</a>
  </li>
  <li>
    <a href={PAGES.lang_lang({ lang: 'fr' })}>Lang fr</a>
  </li>
  <li>
    <a href={PAGES.match_id_int({ id: 1 })}>match int 1</a>
  </li>
  <li>
    <a href={PAGES.match_id_int({ id: 'a' })}>match int a (expect 404)</a>
  </li>
  <li>
    <a href={PAGES.gp_logged_one()}>gp One</a>
  </li>
  <li>
    <a href="/gp/two">gp Two</a>
  </li>
</ul>

<hr />

<slot />
