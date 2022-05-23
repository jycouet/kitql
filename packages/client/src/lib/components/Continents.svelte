<script lang="ts">
	import { goto } from '$app/navigation';
	import { KQL_All_Conti } from '$lib/graphql/_kitql/graphqlStores';
	import { KitQLInfo } from '@kitql/all-in';

	async function manualUpdate() {
		KQL_All_Conti.patch({ continents: [{ name: 'JYC Land', code: 'JYC' }] });
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
	<KitQLInfo store={KQL_All_Conti} />
	<ul>
		{#if $KQL_All_Conti.status === 'LOADING'}
			Loading...
		{:else if $KQL_All_Conti.errors}
			{#each $KQL_All_Conti.errors as error}
				{error}
			{/each}
		{:else}
			{#each $KQL_All_Conti.data?.continents ?? [] as continent}
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
