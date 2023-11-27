<script lang="ts">
	import { route } from '$lib/ROUTES';

	let name = 'jycouet';

	const size = 100;
</script>

<h2>How do you look like?</h2>

<label>
	<p>Name</p>
	<input type="text" placeholder="Your name" bind:value={name} />
	<p>
		<img width={size} src={route('gravatar', { str: name, s: size })} alt="Can't be displayed in Cloud IDE." />
		<img width={size} src={route('github_avatar', { author: name })} alt="Clone the repo 😉" />
	</p>
</label>
