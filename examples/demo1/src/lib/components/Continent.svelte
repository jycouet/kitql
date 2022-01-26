<script lang="ts">
	import { GetAllCountriesOfContinentQueryStore } from '$lib/graphql/_kitql/graphqlStores';
</script>

<ul>
	{#each $GetAllCountriesOfContinentQueryStore.data?.continent.countries as country}
		<li>{country.name}</li>
	{/each}
</ul>
