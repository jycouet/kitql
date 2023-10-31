<script lang="ts">
  import { ROUTES } from '$lib/ROUTES.js'
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>vite-plugin-kit-routes</h1>

<hr />

<ul>
  <a href={ROUTES['/']()}>Home</a>
  <a href={ROUTES['/site/[param]/[yop]']('param', 'yop', { limit: '2' })}>Another route</a>
</ul>

<hr />

<slot />
