<script lang="ts">
	import { LINKS, PAGES } from '$lib/ROUTES';
</script>

<svelte:head>
	<title>KitQL Remult</title>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>KitQL & Remult</h1>

<hr />

<slot />

<hr />

<ul>
	<li>
		<a href={LINKS.github_remult} target="_blank">⭐️ Remult</a>
	</li>
	<li>
		<a href={LINKS.github_kitql} target="_blank">⭐️ KitQL</a>
	</li>
	<li>
		<a href={LINKS.twitter_jycouet} target="_blank">Twitter</a>
	</li>
</ul>
