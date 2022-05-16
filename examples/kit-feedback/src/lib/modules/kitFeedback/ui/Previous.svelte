<script lang="ts">
	import { resolveTheme, theme } from '../utils/theme';
	import { router, type Route } from '../utils/routes';
	import Icon from '@iconify/svelte';
</script>

{#if $router.from.length > 0}
	<button class={resolveTheme($theme, 'previous-button')} on:click={() => router.previous()}>
		<Icon icon="ic:baseline-chevron-left" />
	</button>
{/if}
