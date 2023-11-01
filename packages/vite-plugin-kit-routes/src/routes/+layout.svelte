<script lang="ts">
  import { ACTIONS, PAGES } from '$lib/ROUTES.js'

  const val = ACTIONS['/site/[id]/two/[hello]']('login', { hello: 'you', id: '1' })
  console.log(`val`, val)
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>vite-plugin-kit-routes</h1>

<hr />

<ul>
  <a href={PAGES['/']()}>Home</a>
  <a href={PAGES['/site/[param]/[yop]']({ param: 'param', yop: 'yop' }, { limit: '2' })}
    >Another route</a
  >
</ul>

<hr />

<slot />
