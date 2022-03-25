<script context="module" lang="ts">
	import { KQL_AllContinents, KQL_AllCountriesOfContinent } from '$lib/kitql/generated/stores';
	import { get } from 'svelte/store';
	import { KitQLInfo } from '@kitql/all-in';

	export async function load({ fetch, url, params, session, stuff }) {
		const code = params.code;
		const continentFound = get(KQL_AllContinents).data?.continents.find((c) => c.code === code);

		KQL_AllCountriesOfContinent.patch(
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

		KQL_AllCountriesOfContinent.queryLoad({
			fetch,
			variables: { code },
			settings: { policy: 'cache-and-network' }
		});

		return {};
	}
</script>

<h1>
	<a href="/continents">&laquo; Go back</a> | Continent:
	<b>{$KQL_AllCountriesOfContinent.data?.continent?.name}</b>
	({$KQL_AllCountriesOfContinent.data?.continent?.code}) | isFetching:
	<b>{$KQL_AllCountriesOfContinent.isFetching}</b>
</h1>

{#if $KQL_AllCountriesOfContinent.isFetching && !$KQL_AllCountriesOfContinent.data}
	Loading...
{:else if $KQL_AllCountriesOfContinent.errors}
	{#each $KQL_AllCountriesOfContinent.errors as error}
		{error}
	{/each}
{:else}
	<ul>
		{#each $KQL_AllCountriesOfContinent.data?.continent?.countries || [] as country}
			<li>
				{country.code} - {country.name}
			</li>
		{:else}
			No countries
		{/each}
	</ul>
{/if}
