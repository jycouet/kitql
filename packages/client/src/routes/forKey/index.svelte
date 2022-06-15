<script context="module" lang="ts">
	import { KQL_All_Conti } from '$lib/graphql/_kitql/graphqlStores';

	export async function load({ fetch }) {
		await KQL_All_Conti.queryLoad({ fetch });
		return {};
	}
</script>

<div>
	<h2>Continents</h2>
	<ul>
		{#if $KQL_All_Conti.status === 'LOADING'}
			Loading...
		{:else if $KQL_All_Conti.errors}
			{#each $KQL_All_Conti.errors as error}
				{error}
			{/each}
		{:else}
			{#each $KQL_All_Conti.data?.continents ?? [] as continent}
				<li>
					<p>{continent?.name}</p>
					<a sveltekit:prefetch href={`/continents/${continent?.code}`}>Get Countries</a>
				</li>
			{:else}
				No data
			{/each}
		{/if}
	</ul>
</div>
