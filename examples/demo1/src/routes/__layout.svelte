<script lang="ts">
	import { KQL__Init } from '$lib/graphql/_kitql/graphqlStores';

	// KQL__Init();
</script>

<svelte:head>
	<title>KitQL</title>
</svelte:head>

<h1 class="vAlign">Welcome to KitQL <img class="ml-1" src="./logo.svg" alt="logo KitQL" /></h1>

<p>
	Visit <a target="_blanck" href="https://github.com/jycouet/kitql">Github KitQL</a> to read the documentation
</p>

<hr />

<div style="text-align: center">
	<a href="/">Home</a> | <a href="/continent">Continent</a>
</div>

<hr />

<slot />

<style>
	:root {
		background-color: rgba(68, 68, 68, 0.1);
	}

	.vAlign {
		display: flex;
		align-items: center;
	}
	.ml-1 {
		margin-left: 1rem;
	}
</style>
