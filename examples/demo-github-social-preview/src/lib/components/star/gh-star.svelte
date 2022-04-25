<script lang="ts">
	import { KQL_AddStar, KQL_RemoveStar, KQL_UserBestRepo } from '$lib/graphql/_kitql/graphqlStores';
	import type { StarInfoFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import LogoStar from './logo-star.svelte';

	export let id: string;
	export let starInfo: StarInfoFragment | null;

	function setValues(viewerHasStarred: boolean, totalCount: number) {
		const tmpStore = $KQL_UserBestRepo.data;
		tmpStore.user.repositories.nodes[0].viewerHasStarred = viewerHasStarred;
		tmpStore.user.repositories.nodes[0].stargazers.totalCount = totalCount;
		return tmpStore;
	}

	async function toggle() {
		if (starInfo?.viewerHasStarred) {
			// Pre patch
			KQL_UserBestRepo.patch(
				setValues(
					false,
					$KQL_UserBestRepo.data.user.repositories.nodes[0].stargazers.totalCount - 1
				)
			);

			// Mutation
			const result = await KQL_RemoveStar.mutate({ variables: { id } });

			// Post patch
			KQL_UserBestRepo.patch(
				setValues(
					result.data.removeStar.starrable.viewerHasStarred,
					result.data.removeStar.starrable.stargazers.totalCount
				)
			);
		} else {
			KQL_UserBestRepo.patch(
				setValues(true, $KQL_UserBestRepo.data.user.repositories.nodes[0].stargazers.totalCount + 1)
			);

			const result = await KQL_AddStar.mutate({ variables: { id } });

			KQL_UserBestRepo.patch(
				setValues(
					result.data.addStar.starrable.viewerHasStarred,
					result.data.addStar.starrable.stargazers.totalCount
				)
			);
		}

		// Without Optimistic UI, you retrigger the query
		// await KQL_UserBestRepo.query({ settings: { policy: 'network-only' } });
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
