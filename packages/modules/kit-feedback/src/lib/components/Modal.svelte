<script lang="ts">
	import { resolveTheme, theme } from '$lib/theme';
	import Icon from '@iconify/svelte';
	import { createEventDispatcher, getContext } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import Previous from '$lib/components/Previous.svelte';
	import { config } from '$lib/config';
	import Refresh from './Refresh.svelte';
	export let show = false;

	const dispatch = createEventDispatcher();
	const close = () => {
		show = false;
		dispatch('close');
	};
</script>

{#if show}
	<div class={resolveTheme($theme, 'modal')} transition:fade={{ duration: 100 }}>
		<div
			class={resolveTheme($theme, 'modal-box')}
			in:scale={{ duration: 200 }}
			out:fade={{ duration: 100 }}
		>
			<div class={resolveTheme($theme, 'modal-header')}>
				<Previous />
				<Refresh />
				<div class={resolveTheme($theme, 'modal-title')}>
					{$config.title}
				</div>
				<div on:click={close} class={resolveTheme($theme, 'modal-exit')}>
					<slot name="exit">
						<Icon icon="mdi:close-circle" />
					</slot>
				</div>
			</div>
			<div class={resolveTheme($theme, 'modal-content')}>
				<slot />
			</div>
		</div>
	</div>
{/if}
