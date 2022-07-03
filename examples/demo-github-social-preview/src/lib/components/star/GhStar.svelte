<script lang="ts">
	import { GQL_AddStar, GQL_RemoveStar, type starInfo$data } from '$houdini';
	import LogoStar from './logo-star.svelte';

	export let id: string;
	export let starInfo: starInfo$data | null;

	async function toggle() {
		const totalCount = starInfo.stargazers.totalCount;
		if (starInfo?.viewerHasStarred) {
			await GQL_RemoveStar.mutate({
				variables: { id },
				optimisticResponse: {
					removeStar: {
						clientMutationId: 'From KitQL',
						starrable: {
							__typename: 'Repository',
							id,
							viewerHasStarred: false,
							stargazers: { totalCount }
						}
					}
				}
			});
		} else {
			await GQL_AddStar.mutate({
				variables: { id },
				optimisticResponse: {
					addStar: {
						clientMutationId: 'From KitQL',
						starrable: {
							__typename: 'Repository',
							id,
							viewerHasStarred: true,
							stargazers: { totalCount }
						}
					}
				}
			});
		}

		// Without Optimistic UI, you retrigger the query
		// await GQL_UserBestRepo.query({ settings: { policy: 'network-only' } });
	}
</script>

<div class="row" on:click={toggle}>
	<LogoStar filled={starInfo?.viewerHasStarred} />
	<span class="number"> {starInfo?.stargazers.totalCount ?? `Loading...`} </span>
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
	}

	.number {
		margin-left: 14px;
		font-size: x-large;
		font-family: 'exo medium';
		font-weight: bold;
	}
</style>
