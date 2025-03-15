<script lang="ts">
	import { repo } from 'remult'

	import { User } from '../../shared/User.js'

	let secretContent = $state('???')

	let users = $state<User[]>([])

	$effect(() => {
		User.hi(true).then((content) => {
			secretContent = content
		})
	})

	$effect(() => {
		return repo(User)
			.liveQuery()
			.subscribe((info) => {
				users = info.applyChanges(users)
			})
	})
</script>

<h2>Bye bye decorators entity</h2>
secretContent: {secretContent}

<hr />
<button
	onclick={() => {
		repo(User).insert({ name: 'test ' + new Date().toISOString() })
	}}>Add</button
>

{#each users as user}
	<div>
		{user.name}
		<button
			onclick={() => {
				repo(User).delete({ id: user.id })
			}}>Delete</button
		>
	</div>
{/each}
