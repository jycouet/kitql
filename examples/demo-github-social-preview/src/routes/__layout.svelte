<script context="module" lang="ts">
	import { houdiniClient } from '$graphql/client';

	houdiniClient.init();
</script>

<svelte:head>
	<title>KitQL Demo - Svelte London - March 23, 2022</title>
</svelte:head>

<h1>Welcome to KitQL</h1>

Menu:
<a href="/">Home</a>
<a href="/about">About</a>

<div>
	<slot />
</div>

<style>
	:root {
		background-color: #0a1d41;
		color: #fff;
		font-size: x-large;
	}

	:global(a) {
		color: #ff3e00;
	}

	div {
		padding: 14px;
	}
</style>
