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
		<div class="country">
			{#each $KQL_AllCountriesOfContinent.data?.continent.countries as country, i}
				{#if i < 10}
					<div>
						{country.name}
					</div>
				{:else}
					.
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.country {
		font-size: small;
	}
</style>
