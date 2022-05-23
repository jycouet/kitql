<script context="module" lang="ts">
	import Countries from '$lib/components/Countries.svelte';
	import { KQL_All_Conti, KQL_AllCountriesOfContinent } from '$lib/graphql/_kitql/graphqlStores';
	import { get } from 'svelte/store';

	export async function load({ fetch, params }) {
		const code = params.code;
		const continentFound = get(KQL_All_Conti).data?.continents.find((c) => c.code === code);
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

		await KQL_AllCountriesOfContinent.queryLoad({ fetch, variables: { code: params.code } });
		return {};
	}
</script>

<Countries />
