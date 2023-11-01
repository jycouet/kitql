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
  <li><a href={PAGES.site_id({ id: 'Paris' })}>Site Paris</a></li>
  <li>
    <a href={PAGES.site_contract_siteId_contractId({ siteId: 'Paris', contractId: 'First' })}>
      Site Paris & Contract First
    </a>
  </li>
</ul>

<hr />

<slot />
