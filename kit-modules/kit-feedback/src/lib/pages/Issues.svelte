<script lang="ts">
	import { browser } from '$app/env';
	import IssueList from '$lib/components/issues/ISSUE_List.svelte';
	import { config } from '$lib/config';
	import { KQL_Issues } from '$lib/graphql/_kitql/graphqlStores';
	import { IssueState, type IssueFilters } from '$lib/graphql/_kitql/graphqlTypes';
	import Icon from '@iconify/svelte';
	import { resolveTheme, theme } from '$lib/theme';
	import IssueCreate from '$lib/components/issues/ISSUE_Create.svelte';

	export let filters: Omit<IssueFilters, 'states'> = {};
	export let title: string = 'Issues';
	export let milestoneId: string = undefined;

	let state: IssueState = IssueState.Open;

	$: browser &&
		KQL_Issues.query({
			variables: {
				repository: $config.repository.name,
				owner: $config.repository.owner,
				filters: { ...filters, states: [state] },
				take: $config.issues.pagination
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
				{resolveTheme($theme, state === IssueState.Open ? 'issues-state-tab-active' : undefined)}
			"
				on:click={() => (state = IssueState.Open)}
			>
				{$config.issues?.text?.states?.open ?? 'Open'}
			</span>
			<span
				class="
				{resolveTheme($theme, 'issues-state-tab')}
				{resolveTheme($theme, state === IssueState.Closed ? 'issues-state-tab-active' : undefined)}
			"
				on:click={() => (state = IssueState.Closed)}
			>
				{$config.issues?.text?.states?.closed ?? 'Closed'}
			</span>
		</div>

		{#if $KQL_Issues.status === 'LOADING'}
			<Icon icon="eos-icons:loading" />
		{:else}
			<IssueList issues={$KQL_Issues.data?.repository?.issues?.nodes} />
		{/if}
	</div>
</div>
