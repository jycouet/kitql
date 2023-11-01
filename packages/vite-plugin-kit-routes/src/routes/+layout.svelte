<script lang="ts">
  import { ACTIONS, PAGES } from '$lib/ROUTES.js'

  const l = PAGES['/site/[id]']({ id: '1' })
  const val = ACTIONS['/site/[id]/two/[hello]']('login', { id: '1', hello: 'you' })
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

<!-- Today... strings... Are you sure? -->
<a href="/site/1">Site 1</a>
<!-- The route is existing ? Right now yes... But in 6 months? With 100 routes? Are you sure?-->
<form method="POST" action="/site/1/two/you?/login" />
<!-- The action login is existing in this route ? -->

<!-- With ✨ vite-plugin-kit-routes ✨, 
  you have PAGES, SERVERS, ACTIONS 
  generated from your actual routes 
  If you rename a route / actions, "npm run check" will complain.
-->
<a href={PAGES['/site/[id]']({ id: '1' })}>Site 1</a>
<form
  method="POST"
  action={ACTIONS['/site/[id]/two/[hello]']('login', { id: '1', hello: 'you' })}
/>
