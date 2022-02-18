<script lang="ts">
	import { AllCountriesOfContinentQueryStore } from '$lib/graphql/_kitql/graphqlStores';
	import KitQlInfo from './KitQLInfo.svelte';
</script>

<div>
	<h2>
		{#if $AllCountriesOfContinentQueryStore.data}
			Continent: {$AllCountriesOfContinentQueryStore.data?.continent?.name}
		{:else}
			<i>Please select something</i>
		{/if}
	</h2>
	<KitQlInfo store={$AllCountriesOfContinentQueryStore} />

	{#if $AllCountriesOfContinentQueryStore.data?.continent}
		<div class="country">
			{#each $AllCountriesOfContinentQueryStore.data?.continent.countries as country, i}
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
