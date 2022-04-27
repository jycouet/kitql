# 🚧 [Kit Modules] **Kit Feedback** 🚧

## About it

🚀 The Kit Feedback module lets your users :

- [x] create an issue (with a label set in config)
- [x] see milestones filtered by string filter (ex. : [FEEDBACK]) (to set in config)
- [x] see issues (inside milestones) filtered by label permission (set label in config to tell what the user can see)
- [x] switch between open / closed issues
- [x] add comments on issues
- [x] see only comment with 👀 reaction (or other reaction, to set in config among Github reactions)

⏭️ Next updates :

- [ ] config refactoring
- [ ] upvote/downvote on issues and comments (except when created from Github)
- [ ] screenshots upload (using https://github.com/upload/policies/assets endpoint ?)
- [ ] support for extra (custom) metadata (ex. : page on which the user writes the issue)
- [ ] support for comment EDIT ( & DELETE ? )

## Install

```
yarn add @kitql/kit-feedback
```

## Setup

1. #### Initialize the client

```Javascript
  client.initialize({ token: process.env.GITHUB_API_TOKEN });
```

> Uses env-cmd here with process.env defined in vite because VITE\_ prefix environment variables are public.
> See [packages/modules/kit-feedback/package.json](url) and [packages/modules/kit-feedback/svelte.config.js](url)

2. #### Override the default configuration and add the Feedback component to your code :

```Svelte
<script lang="ts" context="module">
	import { client, config, Feedback } from '@kitql/kit-feedback';
</script>

<script lang="ts">
	let showFeedback = true;
	const me = { id: 'jbruxelle' };

	config.override({
		title: 'Feedback',
		dev: false,
		identifier: () => me.id,
		repository: {
			owner: 'the-owner-name',
			name: 'my-repo-name'
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

<button on:click={() => (showFeedback = true)}>Open feedback</button>

<Feedback bind:showFeedback />

```

3. Enjoy ✨
