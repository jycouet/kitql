<script lang="ts">
	import { config } from '../../utils/config';
	import { resolveTheme, theme } from '../../utils/theme';
	import type { Comment as TComment } from '../../utils/types';
	import CommentDetail from './COMMENT_Detail.svelte';

	export let comments: TComment[];
	$: console.log(`comments`, comments);
</script>

<div class={resolveTheme($theme, 'comments-list')}>
	{#each comments as comment}
		{#if $config.dev || comment.isPublic}
			<CommentDetail {comment} />
		{/if}
	{/each}
</div>
