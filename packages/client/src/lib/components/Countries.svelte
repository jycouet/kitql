<script lang="ts">
	import { KQL_AllCountriesOfContinent } from '$lib/graphql/_kitql/graphqlStores';
	import { KitQLInfo } from '@kitql/all-in';
</script>

<div>
	<h2>
		{#if $KQL_AllCountriesOfContinent.data}
			Continent: {$KQL_AllCountriesOfContinent.data?.continent?.name} ({$KQL_AllCountriesOfContinent
				.data?.continent?.code})
		{/if}
	</h2>
	<KitQLInfo store={KQL_AllCountriesOfContinent} />

	{#if $KQL_AllCountriesOfContinent.status === 'LOADING'}
		Loading...
	{:else if $KQL_AllCountriesOfContinent.errors}
		{#each $KQL_AllCountriesOfContinent.errors as error}
			{error}
		{/each}
	{:else}
		<ul class="overflow_scroll">
			{#each $KQL_AllCountriesOfContinent.data?.continent?.countries ?? [] as country}
				<li>
					<p>{country.name}</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.overflow_scroll {
		max-height: 35vh;
		overflow-y: scroll;
	}
</style>
