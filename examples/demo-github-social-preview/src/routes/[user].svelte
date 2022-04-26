<script context="module" lang="ts">
	export async function load({ fetch, params }) {
		await KQL_UserBestRepo.queryLoad({ fetch, variables: { login: params.user } });
		return {};
	}
</script>

<script lang="ts">
	import GhCard from '$lib/components/gh-card/gh-card.svelte';
	import { KQL_UserBestRepo } from '$lib/graphql/_kitql/graphqlStores';
	import { KitQLInfo } from '@kitql/all-in';
</script>

<KitQLInfo store={KQL_UserBestRepo} />
{#if $KQL_UserBestRepo.data}
	<GhCard userBestRepoInfo={$KQL_UserBestRepo.data.user} />
{/if}
