<script lang="ts">
let { children } = $props()
</script>

<svelte:head>
  <title>Stripper</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

{@render children?.()}
