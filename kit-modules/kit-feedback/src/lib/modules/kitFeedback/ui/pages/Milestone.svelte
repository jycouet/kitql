<script lang="ts">
	import { config } from '../../utils/config';
	import Issues from './Issues.svelte';

	export let title: string;
	export let id: string;
</script>

<div class="flex flex-col gap-4">
	<Issues
		{title}
		milestoneId={id}
		filters={{
			milestoneID: id,
			labels: $config.issues?.filters?.labels
		}}
	/>
</div>
