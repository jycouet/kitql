<script lang="ts">
	import { config } from '$lib/config';

	import {
		KQL_AddReaction,
		KQL_AddComment,
		KQL_Issue,
		KQL_MinimizeComment
	} from '$lib/graphql/_kitql/graphqlStores';
	import { ReactionContent, ReportedContentClassifiers } from '$lib/graphql/_kitql/graphqlTypes';
	import { resolveTheme, theme } from '$lib/theme';
	import type { CommentMetadata } from '$lib/types';
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
			await KQL_AddComment.mutate({
				variables: {
					input: {
						subjectId: issue.id,
						body: values.comment
					}
				}
			});
			await KQL_AddReaction.mutate({
				variables: {
					input: {
						subjectId: $KQL_AddComment.data?.addComment?.commentEdge?.node?.id,
						content: ReactionContent[$config.issues?.comments?.reactionFilter]
					}
				}
			});
			await KQL_AddComment.mutate({
				variables: {
					input: {
						subjectId: issue.id,
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
