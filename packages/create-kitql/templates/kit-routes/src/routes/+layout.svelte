<script lang="ts">
	import { LINKS, PAGES } from '$lib/ROUTES';
</script>

<svelte:head>
	<title>vite-plugin-kit-routes</title>
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2/out/dark.css" />
</svelte:head>

<h1>vite-plugin-kit-routes</h1>

<hr />
<ul>
	<li><a href={PAGES['/']}>Home</a></li>
	<li><a href={PAGES['/your-face']}>Your face</a></li>
	<li><a href={PAGES['/about']}>About</a></li>
</ul>

<hr />

<slot />

<hr />

<ul>
	<li>
		<a href={LINKS.github} target="_blank">⭐️ GitHub KitQL</a>
	</li>
	<li>
		<a href={LINKS.twitter} target="_blank">Twitter</a>
	</li>
</ul>
