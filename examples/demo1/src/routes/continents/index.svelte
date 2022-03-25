<script context="module" lang="ts">
	import { KQL_AllContinents } from '$lib/kitql/generated/stores';
	import { KitQLInfo } from '@kitql/all-in';

	export async function load({ url, fetch, session, stuff }) {
		await KQL_AllContinents.queryLoad({ fetch });
		return {};
	}
</script>

<KitQLInfo store={KQL_AllContinents} />

<h1>Continents</h1>

{#if $KQL_AllContinents.isFetching}
	Loading...
{:else if $KQL_AllContinents.errors}
	{#each $KQL_AllContinents.errors as error}
		{error}
	{/each}
{:else}
	<ul>
		{#each $KQL_AllContinents.data?.continents || [] as continent}
			<li>
				<a href="/continents/{continent.code}">
					{continent.code} - {continent.name}
				</a>
			</li>
		{/each}
	</ul>
{/if}
