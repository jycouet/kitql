<script context="module" lang="ts">
	import Continents from '$lib/components/Continents.svelte';
	import { kitQLClient } from '$lib/graphql/kitQLClient';
	import { KQL_All_Conti } from '$lib/graphql/$kitql/graphqlStores';

	export async function load({ fetch }) {
		await KQL_All_Conti.queryLoad({ fetch });
		return {};
	}
</script>

<script lang="ts">
	function setHeaders() {
		kitQLClient.setHeaders({ Authorization: 'Bearer MY_TOKEN' });
	}
</script>

<button on:click={setHeaders}>SetHeaders</button>

<Continents />
