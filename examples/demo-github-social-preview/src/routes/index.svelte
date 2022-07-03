<script context="module" lang="ts">
	import { browser } from '$app/env';
	import { GQL_Followers, GQL_Me } from '$houdini';
	import Followers from '$lib/components/Followers.svelte';
	import GhImg from '$lib/components/gh-img/gh-img.svelte';
	import { KitQLInfo } from '@kitql/all-in';
	import type { LoadEvent } from '@sveltejs/kit';

	export async function load(event: LoadEvent) {
		await GQL_Me.fetch({ event });
		await GQL_Followers.fetch({ event, variables: { first: 5 } });
		return {};
	}
</script>

<script lang="ts">
	$: browser && GQL_Me.fetch();
	$: browser && GQL_Followers.fetch({ variables: { first: 5 } });
</script>

<!-- Just for debugging -->
<KitQLInfo store={GQL_Me} />

<!-- Me infos -->
<div class="row">Me 👇</div>
<div class="row">
	<GhImg userInfo={$GQL_Me.data?.viewer} />
</div>

<!-- Followers infos -->
<Followers />

<style>
	.row {
		margin-top: 40px;
		margin-bottom: 40px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
	}
</style>
