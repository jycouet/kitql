<script context="module" lang="ts">
	import Countries from '$lib/components/Countries.svelte';
	import {
		KQL_AllContinents,
		KQL_AllCountriesOfContinent
	} from '$lib/graphql/_kitql/graphqlStores';
	import { get } from 'svelte/store';

	export async function load({ fetch, params }) {
		const { code } = params;

		const continentFound = get(KQL_AllContinents).data?.continents.find((c) => c.code === code);
		KQL_AllCountriesOfContinent.patch(
			{
				continent: {
					name: continentFound?.name + ' (patched data)',
					code,
					countries: []
				}
			},
			{ code },
			'store-only'
		);

		await KQL_AllCountriesOfContinent.queryLoad({ fetch, variables: { code } });
		return {};
	}
</script>

<a href="/continent">&laquo; Go back</a>

<Countries />
