<script lang="ts">
	import { browser } from '$app/env';
	import { CachePolicy, GQL_AllContinents } from '$houdini';

	async function query() {
		GQL_AllContinents.fetch({ policy: CachePolicy.NetworkOnly });
	}

	$: browser && GQL_AllContinents.fetch();
</script>

<h2>Continents</h2>
{#if $GQL_AllContinents.isFetching}
	Loading...
{:else}
	<ul>
		{#each $GQL_AllContinents.data?.continents ?? [] as continent}
			<li class="allSpace">
				<a href={`/continent/${continent?.code}`}>{continent?.name}</a>
			</li>
		{:else}
			No data
		{/each}
	</ul>
{/if}

<hr />

<button on:click={() => query()}>ReQuery</button>
