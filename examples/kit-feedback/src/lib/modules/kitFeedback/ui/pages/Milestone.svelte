<script lang="ts">
	import { config } from '../../utils/config';
	import Issues from './Issues.svelte';

	export let id: string;
	export let number: number;
	export let title: string;
</script>

<div class="flex flex-col gap-4">
	<Issues
		{title}
		milestoneId={id}
		filters={{
			milestoneNumber: number.toString(),
			labels: $config.issues?.filters?.labels
		}}
	/>
</div>
