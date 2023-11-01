<script lang="ts">
  import { PAGES } from '$lib/ROUTES.js'
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>vite-plugin-kit-routes</h1>

<hr />

<ul>
  <a href={PAGES['/']()}>Home</a>
  <a href={PAGES['/site/[param]/[yop]']('param', 'yop', { limit: '2' })}>Another route</a>
</ul>

<hr />

<slot />
