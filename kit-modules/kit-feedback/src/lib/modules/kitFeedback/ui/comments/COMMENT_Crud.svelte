<script lang="ts">
	import { config, type KitFeedbackConfig } from '../../utils/config';
	import { type Reaction, type CommentDetailFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import CommentList from './COMMENT_List.svelte';
	import { resolveTheme, theme } from '../../utils/theme';
	import type { CommentMetadata } from '../../utils/types';
	import CommentCreate from './COMMENT_Create.svelte';

	export let comments: CommentDetailFragment[];
	export let issue: { number: number; id: string };

	const parseComments = (comments: CommentDetailFragment[], config: KitFeedbackConfig) => {
		if (comments) {
			console.log(comments);
			return comments.reduce((accumulator, comment, index, array) => {
				if (!comment.isMinimized) {
					let metadata: CommentMetadata;
					let metadataCommentId: string;

					const nextComment = array?.[index + 1];
					console.log('nextComment', nextComment);
					if (nextComment?.isMinimized) {
						try {
							metadataCommentId = nextComment.id;
							metadata = JSON.parse(nextComment.body);
						} catch {
							metadataCommentId = null;
							metadata = null;
						}
					}

					accumulator = [...accumulator, { ...comment, metadataCommentId, metadata }];
				}
				console.log(accumulator);
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
