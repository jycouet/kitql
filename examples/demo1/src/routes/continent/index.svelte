<script context="module" lang="ts">
	import { GQL_AllContinents } from '$houdini';
	import Continents from '$lib/components/Continents.svelte';
	import type { LoadEvent } from '@sveltejs/kit';

	export async function load(event: LoadEvent) {
		await GQL_AllContinents.fetch({ event });
		return {};
	}
</script>

<!-- 👇 Store with data, status, ... -->
<!-- {JSON.stringify($GQL_AllContinents.data?.continents, null, 2)} -->

<!-- 👇 Store can be used inside a component directly -->
<Continents />
