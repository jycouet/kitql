<script lang="ts">
	import { config } from '../../utils/config';
	import { resolveTheme, theme } from '../../utils/theme';
	import type { Comment } from '../../utils/types';
	import { resolveAuthor } from './helper';
	import Vote from '../Vote.svelte';

	export let comment: Comment;
	export let isIssueDescription = false;

	$: date = new Date(comment.createdAt);
</script>

<div
	class="
		{resolveTheme($theme, 'comment')} 
		{resolveTheme($theme, comment.metadata ? undefined : 'github-comment')} 
		{resolveTheme($theme, comment.isPublic ? 'public-comment' : 'development-comment')}
		{resolveTheme($theme, isIssueDescription ? 'description-comment' : undefined)}
	"
>
	<p class={resolveTheme($theme, 'comment-header')}>
		<span class={resolveTheme($theme, 'comment-author')}>
			{resolveAuthor(comment, $config)}
			{#if $config.dev}
				({comment.author})
			{/if}
		</span>
		<span class={resolveTheme($theme, 'comment-date')}>
			{date.toLocaleString()}
		</span>
	</p>
	<div class={resolveTheme($theme, 'comment-body')}>
		<div class={resolveTheme($theme, 'comment-content')}>
			{@html comment.bodyHTML}
		</div>
		{#if comment.metadata}
			<div class={resolveTheme($theme, 'comment-votes')}>
				<Vote
					type="up"
					votes={comment.metadata.votes?.up}
					metadataCommentId={comment.metadataCommentId}
					metadata={comment.metadata}
				/>
				<Vote
					type="down"
					votes={comment.metadata.votes?.down}
					metadataCommentId={comment.metadataCommentId}
					metadata={comment.metadata}
				/>
			</div>
		{/if}
	</div>
</div>
