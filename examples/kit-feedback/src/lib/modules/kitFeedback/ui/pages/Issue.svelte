<script lang="ts">
	import { browser } from '$app/env';
	import CommentCrud from '../comments/COMMENT_Crud.svelte';
	import CommentDetail from '../comments/COMMENT_Detail.svelte';
	import { config, type KitFeedbackConfig } from '../../utils/config';
	import { KQL_Issue } from '$lib/graphql/_kitql/graphqlStores';
	import Icon from '@iconify/svelte';
	import { resolveTheme, theme } from '../../utils/theme';
	import type { Comment as TComment, CommentMetadata } from '../../utils/types';
	import type { IssueDetailFragment } from '$lib/graphql/_kitql/graphqlTypes';

	export let number: number;

	$: browser && KQL_Issue.query({ variables: { number } });

	const parseDescription = (issue: IssueDetailFragment, config: KitFeedbackConfig): TComment => {
		const firstComment = issue?.comments?.nodes?.[0];
		let metadata: CommentMetadata;
		let metadataCommentId: string;

		if (firstComment) {
			if (firstComment.isMinimized) {
				try {
					metadataCommentId = firstComment.id;
					metadata = JSON.parse(firstComment.bodyHTML);
				} catch {
					metadataCommentId = null;
					metadata = null;
				}
			}
		}

		return {
			id: issue.id,
			bodyHTML: (issue.bodyHTML as string) || config.issues.text['no-description'],
			createdAt: issue.createdAt,
			author: issue.author,
			metadata,
			metadataCommentId,
			isPublic: true
		};
	};

	$: issue = $KQL_Issue.data?.issue;
</script>

{#if $KQL_Issue.status === 'LOADING'}
	<Icon icon="eos-icons:loading" />
{:else}
	<div class={resolveTheme($theme, 'issue')}>
		<div class={resolveTheme($theme, 'issue-details')}>
			<h2 class={resolveTheme($theme, 'title')}>
				{@html issue?.titleHTML}
			</h2>
			<CommentDetail comment={parseDescription(issue, $config)} isIssueDescription />
		</div>
		<hr />
		<CommentCrud comments={issue?.comments.nodes} issue={{ number, id: issue?.id }} />
	</div>
{/if}
