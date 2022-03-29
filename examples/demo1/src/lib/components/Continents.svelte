<script lang="ts">
	import { KQL_AllContinents } from '$lib/graphql/_kitql/graphqlStores';

	async function manualUpdate() {
		KQL_AllContinents.patch({ continents: [{ name: 'JYC Land', code: 'JYC' }] });
	}
	async function query() {
		KQL_AllContinents.query({ settings: { policy: 'network-only' } });
	}
</script>

<h2>Continents</h2>
{#if $KQL_AllContinents.status === 'LOADING'}
	Loading...
{:else}
	<ul>
		{#each $KQL_AllContinents.data?.continents ?? [] as continent}
			<li class="allSpace">
				<a href={`/continent/${continent?.code}`}>{continent?.name}</a>
			</li>
		{:else}
			No data
		{/each}
	</ul>
{/if}

<hr />

<button on:click={() => manualUpdate()}>Manual Update</button>
<button on:click={() => query()}>ReQuery</button>
