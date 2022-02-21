<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		AllContinentsQuery,
		AllContinentsQueryCacheReset,
		AllContinentsQueryStore
	} from '$lib/graphql/_kitql/graphqlStores';
	import { queryStringApprend } from '@kitql/helper';
	import KitQlInfo from './KitQLInfo.svelte';

	function reset() {
		AllContinentsQueryCacheReset();
	}

	async function query() {
		await AllContinentsQuery();
	}

	async function force() {
		await AllContinentsQuery({ settings: { cache: 0 } });
	}

	async function details(code: string) {
		goto(`?${queryStringApprend($page.url.searchParams, { focus: code })}`);
		// await GetAllCountriesOfContinentQuery({ variables: { code } });
	}
</script>

<div>
	<h2 class="vAlign">
		Continents

		<button on:click={() => reset()}>Reset</button>
		<button on:click={() => query()}>Query again</button>
		<button on:click={() => force()}>Force network</button>
	</h2>
	<KitQlInfo store={$AllContinentsQueryStore} />
	<ul>
		{#each $AllContinentsQueryStore.data?.continents ?? [] as continent}
			<li class="allSpace">
				<p>{continent?.name}</p>
				<button on:click={() => details(continent?.code)}>Get Countries</button>
			</li>
		{:else}
			No data
		{/each}
	</ul>
</div>

<style>
	.allSpace {
		display: flex;
		flex: 1;
		justify-content: space-between;
	}

	.vAlign {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	li {
		padding: 0.5rem;
	}
</style>
