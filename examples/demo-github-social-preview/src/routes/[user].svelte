<script context="module" lang="ts">
	import { browser } from '$app/env';
	import { GQL_UserBestRepo, type UserBestRepo$input } from '$houdini';
	import GhCard from '$lib/components/GhCard/GhCard.svelte';
	import { KitQLInfo } from '@kitql/all-in';
	import type { LoadEvent } from '@sveltejs/kit';

	export async function load(event: LoadEvent) {
		const variables = { login: event.params.user };
		await GQL_UserBestRepo.fetch({ event, variables });
		return { props: variables };
	}
</script>

<script lang="ts">
	export let variables: UserBestRepo$input;

	$: browser && GQL_UserBestRepo.fetch({ variables });
</script>

<KitQLInfo store={GQL_UserBestRepo} />

{#if $GQL_UserBestRepo.data}
	<GhCard userBestRepoInfo={$GQL_UserBestRepo.data.user} />
{/if}
