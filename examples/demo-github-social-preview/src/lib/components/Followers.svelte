<script lang="ts">
	import { GQL_Followers } from '$houdini';
	import GhImg from './GhImg/GhImg.svelte';
	import ButtonPagination from './pagination/ButtonPagination.svelte';

	// type: FollowersQueryVariables to be used
	function refresh(data: any) {
		GQL_Followers.fetch({ variables: data.detail.data });
	}
</script>

<div class="row">Followers ({$GQL_Followers.data?.viewer.followers.totalCount}) 👇</div>
<div class="row">
	<ButtonPagination
		type="before"
		paginationInfo={$GQL_Followers.data?.viewer?.followers.pageInfo}
		on:paginate={refresh}
	/>

	{#if $GQL_Followers.isFetching}
		Loading...
	{:else}
		{#each $GQL_Followers.data?.viewer?.followers.edges ?? [] as edge}
			<GhImg userInfo={edge.node} />
		{/each}
	{/if}

	<ButtonPagination
		type="after"
		paginationInfo={$GQL_Followers.data?.viewer?.followers.pageInfo}
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
