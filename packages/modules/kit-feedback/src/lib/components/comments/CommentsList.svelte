<script lang="ts">
	import { config } from '$lib/config';
	import { resolveTheme, theme } from '$lib/theme';
	import type { Comment as TComment } from '$lib/types';
	import Comment from './Comment.svelte';

	export let comments: TComment[];
</script>

<div class={resolveTheme($theme, 'comments-list')}>
	{#each comments as comment}
		{#if $config.dev || comment.public}
			<Comment {comment} />
		{/if}
	{/each}
</div>
