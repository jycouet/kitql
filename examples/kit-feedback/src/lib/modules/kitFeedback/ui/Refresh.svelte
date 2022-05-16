<script lang="ts">
	import { KQL_Issue, KQL_Issues, KQL_Milestones } from '$lib/graphql/_kitql/graphqlStores';
	import { resolveTheme, theme } from '../utils/theme';
	import Icon from '@iconify/svelte';
	import { RequestStatus } from '@kitql/client';

	const refresh = async () => {
		if ($KQL_Milestones.status === RequestStatus.DONE) {
			await KQL_Milestones.query({ settings: { policy: 'network-only' } });
		}
		if ($KQL_Issues.status === RequestStatus.DONE) {
			await KQL_Issues.query({ settings: { policy: 'network-only' } });
		}
		if ($KQL_Issue.status === RequestStatus.DONE) {
			await KQL_Issue.query({ settings: { policy: 'network-only' } });
		}
	};
</script>

<button class={resolveTheme($theme, 'refresh-button')} on:click={refresh}>
	<Icon icon="mdi:refresh" />
</button>
