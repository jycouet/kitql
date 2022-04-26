<script lang="ts">
	import { config } from '$lib/config';
	import Issues from '$lib/pages/Issues.svelte';

	export let number: number;
	export let title: string;
	export let id: string;
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
