import Issue from '$lib/pages/Issue.svelte';
import Issues from '$lib/pages/Issues.svelte';
import Milestone from '$lib/pages/Milestone.svelte';
import Milestones from '$lib/pages/Milestones.svelte';
import { routable, type Component, type Routable } from '$lib/types';
import NewIssue from '$lib/pages/NewIssue.svelte';

export type Route = 'ISSUES' | 'ISSUE' | 'CREATE_ISSUE' | 'MILESTONES' | 'MILESTONE';

export const routes: Record<Route, Component> = {
	ISSUES: Issues,
	ISSUE: Issue,
	CREATE_ISSUE: NewIssue,
	MILESTONES: Milestones,
	MILESTONE: Milestone
};

export const router: Routable = routable('MILESTONES');
