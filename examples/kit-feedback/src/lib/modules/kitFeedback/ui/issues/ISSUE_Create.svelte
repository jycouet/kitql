<script lang="ts">
	import { config } from '../../utils/config';
	import { router } from '../../utils/routes';
	import { resolveTheme, theme } from '../../utils/theme';

	export let milestoneId: string = undefined;
	export let milestoneTitle: string = undefined;

	const navigate = () => {
		router.goto('CREATE_ISSUE', { milestoneId, milestoneTitle });
	};
</script>

<button class={resolveTheme($theme, 'button-primary')} on:click={navigate}>
	{$config.issues.text['create-button']}
</button>
