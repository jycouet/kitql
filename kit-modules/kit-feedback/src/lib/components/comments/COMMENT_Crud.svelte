<script lang="ts">
	import { config, type KitFeedbackConfig } from '$lib/config';
	import { ReactionContent, type CommentDetailFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import CommentList from '$lib/components/comments/COMMENT_List.svelte';
	import { resolveTheme, theme } from '$lib/theme';
	import type { CommentMetadata } from '$lib/types';
	import CommentCreate from '$lib/components/comments/COMMENT_Create.svelte';

	export let comments: CommentDetailFragment[];
	export let issue: { number: number; id: string };

	const parseComments = (comments: CommentDetailFragment[], config: KitFeedbackConfig) => {
		if (comments) {
			const reactionFilter = ReactionContent[config.issues?.comments?.reactionFilter];
			return comments.reduce((accumulator, comment, index, array) => {
				if (!comment.isMinimized) {
					let metadata: CommentMetadata;
					let metadataCommentId: string;

					const nextComment = array?.[index + 1];
					if (nextComment?.isMinimized) {
						try {
							metadataCommentId = nextComment.id;
							metadata = JSON.parse(nextComment.body);
						} catch {
							metadataCommentId = null;
							metadata = null;
						}
					}
					const reaction = comment.reactionGroups.find((group) => group.content === reactionFilter);
					const isPublic = reaction.reactors.totalCount > 0;
					accumulator = [
						...accumulator,
						{ ...comment, metadataCommentId, metadata, public: isPublic }
					];
				}
				return accumulator;
			}, []);
		}
		return [];
	};
</script>

<div class={resolveTheme($theme, 'comments')}>
	<CommentList comments={parseComments(comments, $config)} />
	<CommentCreate {issue} />
</div>
