<script lang="ts" context="module">
	import { config } from '$modules/kitFeedback/utils/config';
	import Feedback from '$modules/kitFeedback/ui/Feedback.svelte';
	import type { Reaction } from '$lib/graphql/_kitql/graphqlTypes';
</script>

<script lang="ts">
	let showFeedback = false;
	const me = { id: 'test user' };

	config.override({
		title: 'Feedback',
		dev: false,
		identifier: () => me.id,
		repository: {
			id: 'R_kgDOGkDBjQ',
			name: 'my-minion-mr',
			owner: 'dynamic-process'
		},
		staff: {
			members: {
				jycouet: 'Support My Minion',
				jbruxelle: 'Support My Minion'
			}
		},
		milestones: {
			filter: '[Gitkit]',
			removeFilterFromName: true
		},
		issues: {
			text: {
				'create-button': 'Ajouter',
				create: {
					'title-field': {
						label: 'Titre',
						placeholder: 'Titre de votre ticket...'
					},
					'description-field': {
						label: 'Description',
						placeholder: 'Description de votre problème ou demande...'
					},
					submit: {
						validate: 'Valider'
						// cancel: 'Annuler'
					}
				},
				states: {
					open: 'En cours',
					closed: 'Traité'
				},
				'no-description': 'Aucune description'
			},
			filters: {
				labels: ['CAPA', 'COMMON']
			},
			create: {
				label: 'LA_kwDOGkDBjc7yAbx7',
				metadata: () => ({
					bla: 'id'
				})
			},
			comments: {
				create: {
					placeholder: 'Votre commentaire ici...'
				},
				reactionFilter: 'EYES'
			}
		}
	});
</script>

<button on:click={() => (showFeedback = true)}>Open feedback</button>

<Feedback bind:showFeedback />
