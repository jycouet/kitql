<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	import { route } from '$lib/ROUTES.js'

	const emojis = ['🚀', '🙏']
</script>

<div>
	<p>🤪</p>
	<select
		bind:value={page.params.emoji}
		on:change={() => {
			goto(
				route('/[u+d83e][u+dd2a]/[emoji]/[u+2b50]', {
					emoji: page.params.emoji,
				}),
			)
		}}
	>
		{#each emojis as emoji}
			<option value={emoji}>{emoji}</option>
		{/each}
	</select>
	<p>⭐</p>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		gap: 20px;
	}
</style>
