<script lang="ts">
	import { resolveTheme, theme } from '$lib/theme';
	import { router, type Route } from '$lib/routes';
	import Icon from '@iconify/svelte';
</script>

{#if $router.from.length > 0}
	<button class={resolveTheme($theme, 'previous-button')} on:click={() => router.previous()}>
		<Icon icon="ic:baseline-chevron-left" />
	</button>
{/if}
