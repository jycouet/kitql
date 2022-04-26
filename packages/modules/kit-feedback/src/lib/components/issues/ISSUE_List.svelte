<script lang="ts">
	import type { IssuePreviewFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import { resolveTheme, theme } from '$lib/theme';
	import IssuePreview from '$lib/components/issues/ISSUE_Preview.svelte';

	export let issues: IssuePreviewFragment[];
</script>

<div class={resolveTheme($theme, 'issues-list')}>
	{#each issues ?? [] as issue}
		<IssuePreview {issue} />
	{/each}
</div>
