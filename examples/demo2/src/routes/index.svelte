<script context="module" lang="ts">
	export async function load({}) {
		return {};
	}
</script>

<svelte:head>
	<title>KitQL</title>
</svelte:head>

<h1 class="vAlign">Welcome to KitQL <img class="ml-1" src="./logo.svg" alt="logo KitQL" /></h1>

<p>
	Visit <a target="_blanck" href="https://github.com/jycouet/kitql">Github KitQL</a> to read the documentation
</p>

<hr />

<div class="grid" />
Check your own SvelteKit #GraphQL endpoint on your:<a
	href="/api/playql"
	target="_blank"
	rel="external">Graph<i>i</i>QL</a
>

<br />
<br />
<div style="font-size: medium;">
	Using:
	<a href="https://www.the-guild.dev/blog/announcing-graphql-yoga-2">GraphQL Yoga 2</a>
</div>

<style>
	:root {
		background-color: #0a1d41;
		color: #fff;
		font-size: x-large;
	}

	:global(a) {
		color: #ff3e00;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 1rem;
	}

	.vAlign {
		display: flex;
		align-items: center;
	}
	.ml-1 {
		margin-left: 1rem;
	}
</style>
