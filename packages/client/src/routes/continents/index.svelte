<script context="module" lang="ts">
	import Continents from '$lib/components/Continents.svelte';
	import { KQL_AllContinents } from '$lib/graphql/_kitql/graphqlStores';

	export async function load({ fetch, url, params, session, stuff }) {
		await KQL_AllContinents.queryLoad({ fetch });
		return {};
	}
</script>

<Continents />
