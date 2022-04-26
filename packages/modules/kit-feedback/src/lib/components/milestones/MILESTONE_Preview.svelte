<script lang="ts">
	import { config } from '$lib/config';
	import type { MilestonePreviewFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import { router } from '$lib/routes';
	import { computeMilestoneTitle } from './helper';

	export let milestone: MilestonePreviewFragment;

	const redirect = () =>
		router.goto('MILESTONE', {
			id: milestone.id,
			number: milestone.number,
			title: computeMilestoneTitle(
				milestone.title,
				$config.milestones.removeFilterFromName,
				$config.milestones.filter
			)
		});
</script>

<div class="cursor-pointer" on:click={redirect}>
	{computeMilestoneTitle(
		milestone.title,
		$config.milestones.removeFilterFromName,
		$config.milestones.filter
	)}
</div>
