import type { Route } from '$lib/routes';
import { overridable, type Overridable } from '$lib/types';
import type { ReactionContent } from '$lib/graphql/_kitql/graphqlTypes';
import { writable, type Writable } from 'svelte/store';

type Reaction = keyof typeof ReactionContent;
type ReactionFilter = Exclude<Reaction, 'ThumbsDown' | 'ThumbsUp'>;

/**
 * @param identifier - a function returning an identity string for comment or issue author.
 * @param development - wether KitFeedback is opened in development or not.
 * @param repository - the repository to access
 * @param home - the home route
 * @param routes - routes that can be accessed
 * */
export type KitFeedbackConfig = {
	title?: string;
	identifier: () => string;
	dev: boolean;
	home?: Route;
	routes?: Route[];
	repository: {
		name: string;
		owner: string;
	};
	staff?: {
		members?: Record<string, string>;
	};
	issues?: {
		text?: {
			'create-button'?: string;
			create?: {
				'title-field'?: {
					label?: string;
					placeholder?: string;
				};
				'description-field'?: {
					label?: string;
					placeholder?: string;
				};
				submit?: {
					validate?: string;
					cancel?: string;
				};
			};
			states?: {
				open: string;
				closed: string;
			};
			'no-description'?: string;
		};
		filters?: {
			labels?: string[];
		};
		create?: {
			template?: string;
			label?: string;
		};
		pagination?: number;
		comments?: {
			reactionFilter?: ReactionFilter;
			create?: {
				placeholder?: string;
			};
		};
	};
	milestones?: {
		whitelist?: number[];
		filter?: string;
		removeFilterFromName?: boolean;
	};
	resetCacheOnClose?: boolean;
};

export const defaultConfig: KitFeedbackConfig = {
	title: 'Kit feedback',
	identifier: () => '',
	dev: false,
	repository: {
		name: 'KitFeedback',
		owner: 'jbruxelle'
	},
	home: 'MILESTONE',
	routes: ['MILESTONE', 'ISSUES', 'ISSUE'],
	issues: {
		text: {
			'create-button': 'New issue',
			create: {
				'title-field': {
					label: 'Title',
					placeholder: 'Your new issue title...'
				},
				'description-field': {
					label: 'Description',
					placeholder: 'Your new issue description...'
				},
				submit: {
					validate: 'Validate',
					cancel: 'Cancel'
				}
			},
			states: {
				open: 'Open',
				closed: 'Closed'
			},
			'no-description': 'No description provided'
		},
		create: {
			template: `
			### REASON
			`
		},
		pagination: 25,
		comments: {
			reactionFilter: 'Eyes',
			create: {
				placeholder: 'Your comment here...'
			}
		}
	},
	milestones: {
		whitelist: undefined,
		filter: undefined,
		removeFilterFromName: false
	},
	resetCacheOnClose: false
};

export const config: Overridable<KitFeedbackConfig> = overridable<KitFeedbackConfig>(defaultConfig);
export const repositoryId: Writable<string> = writable();
export const createIssueLabelId: Writable<string> = writable();
