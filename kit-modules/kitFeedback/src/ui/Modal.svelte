<script lang="ts">
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { config } from '../utils/config';
	import { resolveTheme, theme } from '../utils/theme';
	import Previous from './Previous.svelte';
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
