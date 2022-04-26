<script lang="ts" context="module">
	import { config, Feedback } from '$lib';
</script>

<script lang="ts">
	let show = true;
	const me = { id: 'jbruxelle' };

	config.override({
		title: 'Feedback',
		dev: false,
		identifier: () => me.id,
		repository: {
			name: 'my-repo-name',
			owner: 'the-owner-name'
		},
		staff: {
			members: {
				jycouet: 'Support',
				jbruxelle: 'Support'
			}
		},
		milestones: {
			filter: '[Feedback]',
			removeFilterFromName: true
		},
		issues: {
			text: {
				'create-button': 'New request',
				create: {
					'title-field': {
						label: 'Title',
						placeholder: 'Your request title'
					},
					'description-field': {
						label: 'Description',
						placeholder: 'Tell us more about your request'
					},
					submit: {
						validate: 'Confirm',
						cancel: 'Cancel'
					}
				},
				states: {
					open: 'Open',
					closed: 'Done'
				},
				'no-description': 'No description... sorry'
			},
			filters: {
				labels: ['question']
			},
			create: {
				label: 'question'
			},
			comments: {
				create: {
					placeholder: 'Your comment here !'
				},
				reactionFilter: 'Eyes'
			}
		}
	});
</script>

<button on:click={() => (show = true)}>Open feedback</button>

<Feedback bind:show />
