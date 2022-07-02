<script lang="ts">
	import { GQL_AllCountriesOfContinent } from '$houdini';
</script>

<div>
	<h2>
		{#if $GQL_AllCountriesOfContinent.data}
			Continent: {$GQL_AllCountriesOfContinent.data?.continent?.name}
		{:else}
			<i>Loading...</i>
		{/if}
	</h2>

	{#if $GQL_AllCountriesOfContinent.data?.continent}
		<ul>
			{#each $GQL_AllCountriesOfContinent.data?.continent?.countries ?? [] as country}
				<li>
					{country.name}
				</li>
			{/each}
		</ul>
	{/if}
</div>
