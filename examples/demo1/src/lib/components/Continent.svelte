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
		<ul>
			{#each $GetAllCountriesOfContinentQueryStore.data?.continent.countries as country}
				<li>{country.name}</li>
			{/each}
		</ul>
	{/if}
</div>
