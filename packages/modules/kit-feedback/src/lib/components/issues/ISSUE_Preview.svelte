<script lang="ts">
	import type { IssuePreviewFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import { resolveTheme, theme } from '$lib/theme';

	import { router } from '$lib/routes';
	import type { CommentMetadata } from '$lib/types';
	import Vote from '$lib/components/comments/Vote.svelte';

	export let issue: IssuePreviewFragment;

	const redirect = () => router.goto('ISSUE', { number: issue.number });

	const parseFirstCommentData = (issue: IssuePreviewFragment) => {
		const firstComment = issue.comments?.nodes?.[0];
		let metadata: CommentMetadata;
		let metadataCommentId: string;

		if (firstComment) {
			if (firstComment.isMinimized) {
				try {
					metadataCommentId = firstComment.id;
					metadata = JSON.parse(firstComment.body);
				} catch {
					metadataCommentId = null;
					metadata = null;
				}
			}
		}

		return {
			metadata,
			metadataCommentId
		};
	};

	$: firstCommentData = parseFirstCommentData(issue);
</script>

<div class={resolveTheme($theme, 'issue-preview')} on:click={redirect}>
	<div>
		{@html issue.titleHTML}
	</div>
	{#if firstCommentData.metadata}
		<div class={resolveTheme($theme, 'comment-votes')}>
			<Vote
				type="up"
				votes={firstCommentData.metadata.votes?.up}
				metadataCommentId={firstCommentData.metadataCommentId}
				metadata={firstCommentData.metadata}
			/>
			<Vote
				type="down"
				votes={firstCommentData.metadata.votes?.down}
				metadataCommentId={firstCommentData.metadataCommentId}
				metadata={firstCommentData.metadata}
			/>
		</div>
	{/if}
</div>
