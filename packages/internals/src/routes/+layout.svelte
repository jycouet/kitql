<script lang="ts">
let { children } = $props()
</script>

<svelte:head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<ul>
  <li><a href="/">Home</a></li>
</ul>

{@render children?.()}
