<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children: Snippet } = $props()
</script>

<svelte:head>
	<title>@kitql/sveltekit</title>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>@kitql/sveltekit</h1>
<div>
	<a href="/">Home</a> |
	<a href="/sp/example">Example</a> |
	<a href="/sp/advanced">Advanced</a>
</div>

{@render children?.()}
