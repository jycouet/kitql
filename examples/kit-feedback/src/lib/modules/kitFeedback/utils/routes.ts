import Issue from '../ui/pages/Issue.svelte';
import Issues from '../ui/pages/Issues.svelte';
import Milestone from '../ui/pages/Milestone.svelte';
import Milestones from '../ui/pages/Milestones.svelte';
import NewIssue from '../ui/pages/NewIssue.svelte';
import { routable, type Component, type Routable } from './types';

export type Route = 'ISSUES' | 'ISSUE' | 'CREATE_ISSUE' | 'MILESTONES' | 'MILESTONE';

export const routes: Record<Route, Component> = {
	ISSUES: Issues,
	ISSUE: Issue,
	CREATE_ISSUE: NewIssue,
	MILESTONES: Milestones,
	MILESTONE: Milestone
};

export const router: Routable = routable('MILESTONES');
