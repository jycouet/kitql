<script lang="ts">
	import { browser } from '$app/env';
	import IssueList from '../issues/ISSUE_List.svelte';
	import { config } from '../../utils/config';
	import { KQL_Issues } from '$lib/graphql/_kitql/graphqlStores';
	import { type IssueState, type IssueFilters } from '$lib/graphql/_kitql/graphqlTypes';
	import Icon from '@iconify/svelte';
	import { resolveTheme, theme } from '../../utils/theme';
	import IssueCreate from '../issues/ISSUE_Create.svelte';

	export let filters: Omit<IssueFilters, 'states'> = {};
	export let title: string = 'Issues';
	export let milestoneId: string = undefined;

	let state: IssueState = 'OPEN';

	$: browser &&
		KQL_Issues.query({
			variables: {
				filters: { ...filters, states: [state] },
				pagination: {
					take: $config.issues.pagination
				}
			}
		});
</script>

<div class={resolveTheme($theme, 'issues')}>
	<div class={resolveTheme($theme, 'issues-header')}>
		<h2 class={resolveTheme($theme, 'title')}>
			{title}
		</h2>
		<IssueCreate {milestoneId} />
	</div>

	<div class={resolveTheme($theme, 'issues-body')}>
		<div class={resolveTheme($theme, 'issues-state-tabs')}>
			<span
				class="
				{resolveTheme($theme, 'issues-state-tab')}
				{resolveTheme($theme, state === 'OPEN' ? 'issues-state-tab-active' : undefined)}
			"
				on:click={() => (state = 'OPEN')}
			>
				{$config.issues?.text?.states?.open ?? 'Open'}
			</span>
			<span
				class="
				{resolveTheme($theme, 'issues-state-tab')}
				{resolveTheme($theme, state === 'CLOSED' ? 'issues-state-tab-active' : undefined)}
			"
				on:click={() => (state = 'CLOSED')}
			>
				{$config.issues?.text?.states?.closed ?? 'Closed'}
			</span>
		</div>

		{#if $KQL_Issues.status === 'LOADING'}
			<Icon icon="eos-icons:loading" />
		{:else}
			<IssueList issues={$KQL_Issues.data?.issues.nodes} />
		{/if}
	</div>
</div>
