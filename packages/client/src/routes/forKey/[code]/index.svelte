<script context="module" lang="ts">
	import { KQL_All_Conti, KQL_AllCountriesOfContinent } from '$lib/graphql/_kitql/graphqlStores';
	import { get } from 'svelte/store';

	export async function load({ fetch, params }) {
		const code = params.code;
		const continentFound = get(KQL_All_Conti).data?.continents.find((c) => c.code === code);
		const CountriesOfContinent = KQL_AllCountriesOfContinent.forKey(code);
		CountriesOfContinent.patch(
			{
				continent: {
					name: 'PATCH... ' + (continentFound?.name ?? 'No data for Opti UI yet'),
					code,
					countries: []
				}
			},
			{ code },
			'store-only'
		);

		await CountriesOfContinent.queryLoad({ fetch, variables: { code: params.code } });
		return {};
	}
</script>

<script>
	import { page } from '$app/stores';
	const code = $page.params.code;
	const CountriesOfContinent = KQL_AllCountriesOfContinent.forKey(code);
</script>

<div>
	<h2>
		{#if $CountriesOfContinent.data}
			Continent: {$CountriesOfContinent.data?.continent?.name} ({$CountriesOfContinent.data
				?.continent?.code})
		{/if}
	</h2>

	{#if $CountriesOfContinent.status === 'LOADING'}
		Loading...
	{:else if $CountriesOfContinent.errors}
		{#each $CountriesOfContinent.errors as error}
			{error}
		{/each}
	{:else}
		<ul class="overflow_scroll">
			{#each $CountriesOfContinent.data?.continent?.countries ?? [] as country}
				<li>
					<p>{country.name}</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.overflow_scroll {
		max-height: 35vh;
		overflow-y: scroll;
	}
</style>
