<script context="module" lang="ts">
	import Continents from '$lib/components/Continents.svelte';
	import { KQL_AllContinents } from '$lib/graphql/_kitql/graphqlStores';
	import { KitQLInfo } from '@kitql/all-in';

	export async function load({ fetch }) {
		await KQL_AllContinents.queryLoad({ fetch });
		return {};
	}
</script>

<KitQLInfo store={KQL_AllContinents} />

<Continents />
