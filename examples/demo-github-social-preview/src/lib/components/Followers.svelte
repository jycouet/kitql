<script lang="ts">
	import { KQL_Followers } from '$lib/graphql/_kitql/graphqlStores';
	import GhImg from './gh-img/gh-img.svelte';
	import ButtonPagination from './pagination/ButtonPagination.svelte';

	// type: FollowersQueryVariables to be used
	function refresh(data: any) {
		KQL_Followers.query({ variables: data.detail.data });
	}
</script>

<div class="row">Followers ({$KQL_Followers.data?.viewer.followers.totalCount}) 👇</div>
<div class="row">
	<ButtonPagination
		type="before"
		paginationInfo={$KQL_Followers.data?.viewer?.followers.pageInfo}
		on:paginate={refresh}
	/>

	{#if $KQL_Followers.isFetching}
		Loading...
	{:else}
		{#each $KQL_Followers.data?.viewer?.followers.edges ?? [] as edge}
			<GhImg userInfo={edge.node} />
		{/each}
	{/if}

	<ButtonPagination
		type="after"
		paginationInfo={$KQL_Followers.data?.viewer?.followers.pageInfo}
		on:paginate={refresh}
	/>
</div>

<style>
	.row {
		margin-top: 40px;
		margin-bottom: 40px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
	}
</style>
