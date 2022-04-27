<script lang="ts">
	import { config, createIssueLabelId, repositoryId } from '$lib/config';
	import {
		KQL_AddComment,
		KQL_CreateIssue,
		KQL_Issues,
		KQL_MinimizeComment
	} from '$lib/graphql/_kitql/graphqlStores';
	import {
		ReportedContentClassifiers,
		type CreateIssueInput
	} from '$lib/graphql/_kitql/graphqlTypes';
	import { router } from '$lib/routes';
	import { resolveTheme, theme } from '$lib/theme';
	import type { CommentMetadata } from '$lib/types';
	import { validator } from '@felte/validator-vest';
	import { createForm } from 'felte';
	import { create, enforce, test } from 'vest';

	export let milestoneId: string = undefined;

	let initialValues: CreateIssueInput;
	$: initialValues = {
		title: '',
		body: '',
		milestoneId,
		repositoryId: $repositoryId
	};

	const suite = create('form', (data: CreateIssueInput) => {
		test('title', 'Le titre ne peut pas être vide.', () => {
			enforce(data.title).isNotEmpty();
		});
	});

	$: console.log(`milestoneId`, milestoneId);

	$: ({ form } = createForm({
		initialValues,
		extend: validator({ suite }),
		onSubmit: async (values: CreateIssueInput) => {
			const identifier = $config.identifier();
			const metadata: CommentMetadata = {
				author: $config.dev ? $config.staff?.members?.[identifier] : identifier ?? 'Unknown author',
				votes: {
					up: [],
					down: []
				}
			};

			await KQL_CreateIssue.mutate({
				variables: {
					input: {
						title: values.title,
						body: values.body,
						repositoryId: values.repositoryId,
						milestoneId: values.milestoneId,
						labelIds: [$createIssueLabelId]
					}
				}
			});
			await KQL_AddComment.mutate({
				variables: {
					input: {
						subjectId: $KQL_CreateIssue.data.createIssue.issue.id,
						body: JSON.stringify(metadata)
					}
				}
			});
			await KQL_MinimizeComment.mutate({
				variables: {
					input: {
						subjectId: $KQL_AddComment.data.addComment.commentEdge.node.id,
						classifier: ReportedContentClassifiers.OffTopic
					}
				}
			});

			KQL_Issues.resetCache();
			router.goto('ISSUE', { number: $KQL_CreateIssue.data.createIssue.issue.number }, true);
			console.log('should have redirected', $router);
		}
	}));

	const cancel = () => router.previous();
</script>

<form use:form class={resolveTheme($theme, 'new-issue')}>
	<div class={resolveTheme($theme, 'form-control')}>
		<label for="new-issue-title" class={resolveTheme($theme, 'label')}>
			<span class={resolveTheme($theme, 'label-text')}>
				{$config.issues.text.create['title-field'].label}
			</span>
		</label>
		<input
			id="new-issue-title"
			name="title"
			class={resolveTheme($theme, 'input')}
			placeholder={$config.issues.text.create['title-field'].placeholder}
		/>
	</div>
	<div class={resolveTheme($theme, 'form-control')}>
		<label for="new-issue-title" class={resolveTheme($theme, 'label')}>
			<span class={resolveTheme($theme, 'label-text')}>
				{$config.issues.text.create['description-field'].label}
			</span>
		</label>
		<textarea
			id="new-issue-body"
			name="body"
			class={resolveTheme($theme, 'textarea')}
			placeholder={$config.issues.text.create['description-field'].placeholder}
			rows="6"
		/>
	</div>

	<div class="flex justify-end gap-4 p-2">
		<button class={resolveTheme($theme, 'button-neutral')} on:click={cancel}>
			{$config.issues.text.create.submit.cancel}
		</button>
		<button type="submit" class={resolveTheme($theme, 'button-primary')}>
			{$config.issues.text.create.submit.validate}
		</button>
	</div>
</form>
