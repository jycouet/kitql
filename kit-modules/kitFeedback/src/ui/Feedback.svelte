<script lang="ts">
	import { browser } from '$app/env';
	import {
		KQL_Issue,
		KQL_Issues,
		KQL_Milestones,
		KQL_RepositoryConstants
	} from '$lib/graphql/_kitql/graphqlStores';
	import { RequestStatus } from '@kitql/client';
	import './app.postcss';
	import { config, createIssueLabelId, repositoryId } from '../utils/config';
	import { theme, resolveTheme } from '../utils/theme';
	import { router, routes } from '../utils/routes';
	import Modal from './Modal.svelte';

	export let showFeedback = false;

	const handleClose = async () => {
		if (!browser) {
			return;
		}
		if ($config.resetCacheOnClose) {
			if ($KQL_Milestones.status === RequestStatus.DONE) {
				await KQL_Milestones.query({ settings: { policy: 'network-only' } });
			}
			if ($KQL_Issues.status === RequestStatus.DONE) {
				await KQL_Issues.query({ settings: { policy: 'network-only' } });
			}
			if ($KQL_Issue.status === RequestStatus.DONE) {
				await KQL_Issue.query({ settings: { policy: 'network-only' } });
			}
		}
	};

	const initialize = async () => {
		// await KQL_RepositoryConstants.query();
		// $repositoryId = $KQL_RepositoryConstants.data?.repositoryConstants?.repositoryID;
		// $createIssueLabelId = $KQL_RepositoryConstants.data?.repositoryConstants?.createIssueLabelID;
	};

	// $: !$repositoryId && browser && initialize();
</script>

<div class="wrapper {resolveTheme($theme, 'wrapper')}">
	<Modal bind:show={showFeedback} on:close={handleClose}>
		<svelte:component this={routes[$router.route]} {...$router.params} />
	</Modal>
</div>
