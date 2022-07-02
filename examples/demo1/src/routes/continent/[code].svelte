<script context="module" lang="ts">
	import { GQL_AllCountriesOfContinent } from '$houdini';
	import Countries from '$lib/components/Countries.svelte';
	import type { LoadEvent } from '@sveltejs/kit';

	export async function load(event: LoadEvent) {
		const { code } = event.params;
		await GQL_AllCountriesOfContinent.fetch({ event, variables: { code } });
		return {};
	}
</script>

<a href="/continent">&laquo; Go back</a>

<Countries />
