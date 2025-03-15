<script lang="ts">
	let { children } = $props()
</script>

<svelte:head>
	<title>Stripper</title>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<a href="/">Home</a> |
<a href="/demoThrowClass">ThrowClass</a> |
<a href="/demoThrowClass">ThrowRandom</a> |
<a href="/decorators">decorators</a> |
<a href="/decoratorsEntity">decoratorsEntity</a>

<hr />

{@render children?.()}
