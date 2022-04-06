<script context="module" lang="ts">
	import Continents from '$lib/components/Continents.svelte';
	import { KQL_AllContinents } from '$lib/graphql/_kitql/graphqlStores';
	import { KitQLInfo } from '@kitql/all-in';

	export async function load({ fetch }) {
		await KQL_AllContinents.queryLoad({ fetch }); // Work in SSR & Client mode
		// await KQL_another-operation-filling-another-store.queryLoad({ fetch });
		return {};
	}
</script>

<!-- 👇 Store with data, status, ... -->
<!-- {JSON.stringify($KQL_AllContinents.data?.continents, null, 2)} -->

<!-- 👇 Widget to help you building your app -->
<KitQLInfo store={KQL_AllContinents} />

<!-- 👇 Store can be used inside a component directly -->
<Continents />
