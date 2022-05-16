<script lang="ts">
	import type { IssuePreviewFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import { resolveTheme, theme } from '../../utils/theme';

	import { router } from '../../utils/routes';
	import type { CommentMetadata } from '../../utils/types';
	import Vote from '../Vote.svelte';

	export let issue: IssuePreviewFragment;

	const redirect = () => router.goto('ISSUE', { number: issue.number });

	const parseFirstCommentData = (issue: IssuePreviewFragment) => {
		const metadataComment = issue.metadata;
		let metadata: CommentMetadata;
		let metadataCommentId: string;

		if (metadataComment) {
			if (metadataComment.isMinimized) {
				try {
					metadataCommentId = metadataComment.id;
					metadata = JSON.parse(metadataComment.bodyHTML);
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
