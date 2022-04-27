<script lang="ts">
	import { config } from '$lib/config';
	import { router } from '$lib/routes';
	import { resolveTheme, theme } from '$lib/theme';

	export let milestoneId: string = undefined;

	const navigate = () => {
		router.goto('CREATE_ISSUE', { milestoneId });
	};
</script>

<button class={resolveTheme($theme, 'button-primary')} on:click={navigate}>
	{$config.issues.text['create-button']}
</button>
