<script lang="ts">
	import { KQL_AllCountriesOfContinent } from '$lib/graphql/_kitql/graphqlStores';
</script>

<div>
	<h2>
		{#if $KQL_AllCountriesOfContinent.data}
			Continent: {$KQL_AllCountriesOfContinent.data?.continent?.name}
		{:else}
			<i>Loading...</i>
		{/if}
	</h2>

	{#if $KQL_AllCountriesOfContinent.data?.continent}
		<ul>
			{#each $KQL_AllCountriesOfContinent.data?.continent?.countries ?? [] as country, i}
				<li>
					{country.name}
				</li>
			{/each}
		</ul>
	{/if}
</div>
