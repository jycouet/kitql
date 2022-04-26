<script lang="ts">
	import { browser } from '$app/env';
	import Comments from '$lib/components/comments/Comments.svelte';
	import Comment from '$lib/components/comments/Comment.svelte';
	import { config, type KitFeedbackConfig } from '$lib/config';
	import { KQL_Issue } from '$lib/graphql/_kitql/graphqlStores';
	import Icon from '@iconify/svelte';
	import { resolveTheme, theme } from '$lib/theme';
	import type { Comment as TComment, CommentMetadata } from '$lib/types';
	import type { IssueDetailFragment } from '$lib/graphql/_kitql/graphqlTypes';

	export let number: number;

	$: browser &&
		KQL_Issue.query({
			variables: {
				repository: $config.repository.name,
				owner: $config.repository.owner,
				number
			}
		});

	const parseDescription = (issue: IssueDetailFragment, config: KitFeedbackConfig): TComment => {
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
			bodyHTML: (issue.bodyHTML as string) || config.issues.text['no-description'],
			createdAt: issue.createdAt,
			author: issue.author,
			metadata,
			metadataCommentId,
			public: true
		};
	};

	$: issue = $KQL_Issue.data?.repository?.issue;
</script>

{#if $KQL_Issue.status === 'LOADING'}
	<Icon icon="eos-icons:loading" />
{:else}
	<div class={resolveTheme($theme, 'issue')}>
		<div class={resolveTheme($theme, 'issue-details')}>
			<h2 class={resolveTheme($theme, 'title')}>
				{@html issue?.titleHTML}
			</h2>
			<Comment comment={parseDescription(issue, $config)} isIssueDescription />
		</div>
		<hr />
		<Comments comments={issue?.comments.nodes} issue={{ number, id: issue?.id }} />
	</div>
{/if}
