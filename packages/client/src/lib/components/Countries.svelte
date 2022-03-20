<script lang="ts">
	import { KQL_AllCountriesOfContinent } from '$lib/graphql/_kitql/graphqlStores';
	import KitQlInfo from './KitQLInfo.svelte';
</script>

<div>
	<h2>
		{#if $KQL_AllCountriesOfContinent.data}
			Continent: {$KQL_AllCountriesOfContinent.data?.continent?.name}
		{:else}
			<i>Please select something</i>
		{/if}
	</h2>
	<KitQlInfo store={$KQL_AllCountriesOfContinent} />

	{#if $KQL_AllCountriesOfContinent.data?.continent}
		<ul class="overflow_scroll">
			{#each $KQL_AllCountriesOfContinent.data?.continent.countries as country}
				<li class="allSpace">
					<p>{country.name}</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.allSpace {
		display: flex;
		flex: 1;
		justify-content: space-between;
	}
	.overflow_scroll {
		max-height: 35vh;
		overflow-y: scroll;
	}
</style>
