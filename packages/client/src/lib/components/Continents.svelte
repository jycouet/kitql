<script lang="ts">
	import { goto } from '$app/navigation';
	import { KQL_AllContinents } from '$lib/graphql/_kitql/graphqlStores';
	import { KitQLInfo } from '@kitql/comp';

	async function manualUpdate() {
		KQL_AllContinents.patch({ continents: [{ name: 'JYC Land', code: 'JYC' }] });
	}

	async function details(code: string) {
		// goto(`?${queryStringApprend($page.url.searchParams, { focus: code })}`);
		goto(`/continents/${code}`);
	}
</script>

<div>
	<h2>
		Continents
		<div>
			<button on:click={() => manualUpdate()}>Demo patch with some random data</button>
		</div>
	</h2>
	<KitQLInfo store={KQL_AllContinents} />
	<ul>
		{#if $KQL_AllContinents.status === 'LOADING'}
			Loading...
		{:else if $KQL_AllContinents.errors}
			{#each $KQL_AllContinents.errors as error}
				{error}
			{/each}
		{:else}
			{#each $KQL_AllContinents.data?.continents ?? [] as continent}
				<li>
					<p>{continent?.name}</p>
					<button on:click={() => details(continent?.code)}>Get Countries</button>
				</li>
			{:else}
				No data
			{/each}
		{/if}
	</ul>
</div>
