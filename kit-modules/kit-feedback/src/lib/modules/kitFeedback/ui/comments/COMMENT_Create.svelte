<script lang="ts">
	import { config } from '../../utils/config';

	import {
		KQL_AddReaction,
		KQL_CreateComment,
		KQL_Issue,
		KQL_MinimizeComment
	} from '$lib/graphql/_kitql/graphqlStores';
	import { resolveTheme, theme } from '../../utils/theme';
	import type { CommentMetadata } from '../../utils/types';
	import { validator } from '@felte/validator-vest';
	import { createForm } from 'felte';
	import { create, enforce, test } from 'vest';

	export let issue: { id: string };

	const initialValues: { comment: string } = {
		comment: ''
	};

	const suite = create('form', (data) => {
		test('comment', 'Votre commentaire ne peut pas être vide.', () => {
			enforce(data.comment).isNotEmpty();
		});
	});

	const { form } = createForm({
		initialValues,
		extend: validator({ suite }),
		onSubmit: async (values) => {
			const identifier = $config.identifier();
			const metadata: CommentMetadata = {
				author: $config.dev ? $config.staff?.members?.[identifier] : identifier ?? 'Unknown author',
				votes: {
					up: [],
					down: []
				}
			};
			await KQL_CreateComment.mutate({
				variables: {
					fields: {
						issueID: issue.id,
						body: values.comment
					}
				}
			});
			await KQL_AddReaction.mutate({
				variables: {
					fields: {
						subjectID: $KQL_CreateComment.data?.createComment.id,
						content: $config.issues?.comments?.reactionFilter
					}
				}
			});
			await KQL_CreateComment.mutate({
				variables: {
					fields: {
						issueID: issue.id,
						body: JSON.stringify(metadata)
					}
				}
			});
			await KQL_MinimizeComment.mutate({
				variables: {
					fields: {
						commentID: $KQL_CreateComment.data.createComment.id
					}
				}
			});
			await KQL_Issue.query({ settings: { policy: 'network-only' } });
		}
	});
</script>

<form use:form class={resolveTheme($theme, 'create-comment')}>
	<textarea
		name="comment"
		class={resolveTheme($theme, 'textarea')}
		placeholder={$config.issues?.comments?.create?.placeholder ?? 'Your comment here'}
	/>
	<button type="submit" class={resolveTheme($theme, 'button-primary')}> Valider </button>
</form>
