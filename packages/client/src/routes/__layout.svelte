<script>
	import InitClientNavigation from '$lib/toExport/components/InitClientNavigation.svelte';
</script>

<InitClientNavigation />

<h1 class="vAlign">
	Welcome to KitQL <img
		class="ml-1"
		src="https://raw.githubusercontent.com/jycouet/kitql/751636203a851d5f79f9226c25f5eed2b9e7ff20/logo.svg"
		alt="logo KitQL"
	/>
</h1>

<p>
	Visit <a target="_blanck" href="https://github.com/jycouet/kitql">Github KitQL</a> to read the documentation
</p>

<hr />

<a href="/">Home</a>
<a href="/continents">Continents</a>

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
