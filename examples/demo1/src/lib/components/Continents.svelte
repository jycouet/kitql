<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import {
		AllContinentsQuery,
		AllContinentsQueryCacheReset,
		AllContinentsQueryStore,
		AllContinentsQueryStoreUpdate
	} from '$lib/graphql/_kitql/graphqlStores';
	import { queryStringApprend } from '@kitql/helper';
	import KitQlInfo from './KitQLInfo.svelte';

	function reset() {
		AllContinentsQueryCacheReset();
	}

	async function query() {
		await AllContinentsQuery(); // { policy: 'cache-first' }
	}

	async function cacheAndNetwork() {
		await AllContinentsQuery({ settings: { policy: 'cache-and-network' } });
	}

	async function networkOnly() {
		await AllContinentsQuery({ settings: { policy: 'network-only' } });
	}

	async function cacheOnly() {
		await AllContinentsQuery({ settings: { policy: 'cache-only' } });
	}

	async function manualUpdate() {
		AllContinentsQueryStoreUpdate([{ name: 'JYC Land', code: 'JYC' }], 'continents');
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
		<button on:click={() => cacheAndNetwork()}>cache-and-network</button>
		<button on:click={() => networkOnly()}>network-only</button>
		<button on:click={() => cacheOnly()}>cache-only</button>
		<button on:click={() => manualUpdate()}>Manual Update</button>
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
