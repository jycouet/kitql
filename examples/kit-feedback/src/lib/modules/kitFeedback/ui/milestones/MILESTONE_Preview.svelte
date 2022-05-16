<script lang="ts">
	import { config } from '../../utils/config';
	import type { MilestonePreviewFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import { router } from '../../utils/routes';
	import { computeMilestoneTitle } from './helper';

	export let milestone: MilestonePreviewFragment;

	const redirect = () =>
		router.goto('MILESTONE', {
			id: milestone.id,
			number: milestone.number,
			title: milestone.title
		});
</script>

<div class="cursor-pointer" on:click={redirect}>
	{computeMilestoneTitle(
		milestone.title,
		$config.milestones.removeFilterFromName,
		$config.milestones.filter
	)}
</div>
