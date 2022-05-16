<script lang="ts">
	import {
		KQL_CreateComment,
		KQL_CreateIssue,
		KQL_Issues,
		KQL_MinimizeComment
	} from '$lib/graphql/_kitql/graphqlStores';
	import type { CreateIssueFields } from '$lib/graphql/_kitql/graphqlTypes';
	import { validator } from '@felte/validator-vest';
	import { createForm } from 'felte';
	import { create, enforce, test } from 'vest';
	import { config, createIssueLabelId, repositoryId } from '../../utils/config';
	import { router } from '../../utils/routes';
	import { resolveTheme, theme } from '../../utils/theme';
	import type { CommentMetadata } from '../../utils/types';

	export let milestoneId: string = undefined;

	let initialValues: CreateIssueFields;
	$: initialValues = {
		title: '',
		body: '',
		milestoneId: milestoneId,
		repositoryID: $repositoryId
	};

	const suite = create('form', (data: CreateIssueFields) => {
		test('title', 'Le titre ne peut pas être vide.', () => {
			enforce(data.title).isNotEmpty();
		});
	});

	$: ({ form } = createForm({
		initialValues,
		extend: validator({ suite }),
		onSubmit: async (values: CreateIssueFields) => {
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
					fields: {
						title: values.title,
						body: values.body,
						milestoneId: values.milestoneId
					}
				}
			});
			await KQL_CreateComment.mutate({
				variables: {
					fields: {
						issueID: $KQL_CreateIssue.data?.createIssue?.id,
						body: JSON.stringify(metadata)
					}
				}
			});
			await KQL_MinimizeComment.mutate({
				variables: {
					fields: {
						commentID: $KQL_CreateComment.data?.createComment?.id
					}
				}
			});

			KQL_Issues.resetCache();
			router.goto('ISSUE', { number: $KQL_CreateIssue.data?.createIssue?.number }, true);
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
