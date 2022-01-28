<script context="module" lang="ts">
	import Continent from '$lib/components/Continent.svelte';
	import {
		GetAllContinentsQuery,
		GetAllContinentsQueryStore,
		GetAllCountriesOfContinentQuery,
		GetAllCountriesOfContinentQueryStore
	} from '$lib/graphql/_kitql/graphqlStores';

	export async function load({ fetch }) {
		await GetAllContinentsQuery({ fetch });
		return {};
	}
</script>

<script lang="ts">
	async function show(code: string) {
		await GetAllCountriesOfContinentQuery({ variables: { code } });
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
<div class="grid">
	<div>
		<h2>Continents</h2>
		<ul>
			{#each $GetAllContinentsQueryStore.data?.continents as continent}
				<li class="allSpace">
					<p>{continent?.name}</p>
					<button on:click={() => show(continent?.code)}>Get Countries -></button>
				</li>
			{/each}
		</ul>
	</div>

	<div>
		<h2>
			Contient: {$GetAllCountriesOfContinentQueryStore.data?.continent?.name ||
				'_select something_'}
		</h2>
		<h4>
			<pre>Form: {$GetAllCountriesOfContinentQueryStore.from}, Status: {$GetAllCountriesOfContinentQueryStore.status}</pre>
		</h4>
		{#if $GetAllCountriesOfContinentQueryStore.data.continent}
			<Continent />
		{/if}
	</div>
</div>

<style>
	.allSpace {
		display: flex;
		flex: 1;
		justify-content: space-between;
	}

	h4 {
		background-color: gray;
		padding: 0.5rem 0.5rem 0.5rem 0.5rem;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 1rem;
	}

	li {
		padding: 0.5rem;
	}
	.vAlign {
		display: flex;
		align-items: center;
	}
	.ml-1 {
		margin-left: 1rem;
	}
</style>
