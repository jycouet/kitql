<script lang="ts">
	import type { MilestonePreviewFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import MilestonePreview from '$lib/components/milestones/MILESTONE_Preview.svelte';

	export let milestones: MilestonePreviewFragment[];
</script>

{#each milestones ?? [] as milestone}
	<MilestonePreview {milestone} />
{/each}
