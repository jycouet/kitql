<script lang="ts">
	import { browser } from '$app/env';
	import Modal from '$lib/components/Modal.svelte';
	import { config, createIssueLabelId, repositoryId } from '$lib/config';
	import {
		KQL_Initialize,
		KQL_Issue,
		KQL_Issues,
		KQL_Milestones
	} from '$lib/graphql/_kitql/graphqlStores';
	import { router, routes } from '$lib/routes';
	import { resolveTheme, theme } from '$lib/theme';
	import { RequestStatus } from '@kitql/client';
	import '../app.postcss';

	export let showFeedback = false;

	const handleClose = async () => {
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
		await KQL_Initialize.query({
			variables: {
				repository: $config.repository.name,
				owner: $config.repository.owner,
				createIssueLabelName: $config.issues.create.label
			}
		});
		$repositoryId = $KQL_Initialize.data?.repository?.id;
		$createIssueLabelId = $KQL_Initialize.data?.repository?.label?.id;
	};

	$: !$repositoryId && browser && initialize();
</script>

<div class="wrapper {resolveTheme($theme, 'wrapper')}">
	<Modal bind:show={showFeedback} on:close={handleClose}>
		<svelte:component this={routes[$router.route]} {...$router.params} />
	</Modal>
</div>
