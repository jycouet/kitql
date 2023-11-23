<script lang="ts">
	import { LINKS } from '$lib/ROUTES';

	let name = 'jycouet';

	const size = 100;
</script>

<h2>How do you look like?</h2>

<label>
	<p>Name</p>
	<input type="text" placeholder="Your name" bind:value={name} />
	<p>
		<img width={size} src={LINKS.gravatar({ str: name, s: size })} alt="CORS issue?" />
		<img width={size} src={LINKS.github_avatar({ author: name })} alt="CORS issue?" />
	</p>
</label>
