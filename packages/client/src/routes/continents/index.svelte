<script context="module" lang="ts">
	import Continents from '$lib/components/Continents.svelte';
	import { kitQLClient } from '$lib/graphql/kitQLClient';
	import { KQL_AllContinents } from '$lib/graphql/_kitql/graphqlStores';

	export async function load({ fetch, url, params, session, stuff }) {
		await KQL_AllContinents.queryLoad({ fetch });
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
