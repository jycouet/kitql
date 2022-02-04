<script lang="ts">
	import { GetAllCountriesOfContinentQueryStore } from '$lib/graphql/_kitql/graphqlStores';
	import KitQlInfo from './KitQLInfo.svelte';
</script>

<div>
	<h2>
		{#if $GetAllCountriesOfContinentQueryStore.data}
			Continent: {$GetAllCountriesOfContinentQueryStore.data?.continent?.name}
		{:else}
			<i>Please select something</i>
		{/if}
	</h2>
	<KitQlInfo store={$GetAllCountriesOfContinentQueryStore} />

	{#if $GetAllCountriesOfContinentQueryStore.data?.continent}
		<div class="country">
			{#each $GetAllCountriesOfContinentQueryStore.data?.continent.countries as country, i}
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
