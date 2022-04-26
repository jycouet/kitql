<script lang="ts">
	import { browser } from '$app/env';
	import { config } from '$lib/config';
	import { KQL_Milestones } from '$lib/graphql/_kitql/graphqlStores';
	import Icon from '@iconify/svelte';
	import MilestonesList from '$lib/components/milestones/MilestonesList.svelte';

	export let take: number = 25;

	$: browser &&
		KQL_Milestones.query({
			variables: {
				repository: $config.repository.name,
				owner: $config.repository.owner,
				filter: $config.milestones.filter,
				take
			}
		});
</script>

{#if $KQL_Milestones.status === 'LOADING'}
	<Icon icon="eos-icons:loading" />
{:else}
	<MilestonesList milestones={$KQL_Milestones.data?.repository?.milestones?.nodes} />
{/if}
