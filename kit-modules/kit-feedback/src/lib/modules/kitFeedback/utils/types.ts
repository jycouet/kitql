import type { Route } from './routes';
import type { Class } from './theme';
import type { SvelteComponent } from 'svelte';
import { writable, type Readable } from 'svelte/store';
import { merge } from './merge';
import type { CommentDetailFragment } from '$lib/graphql/_kitql/graphqlTypes';

export type Component = new (...args: any[]) => SvelteComponent;

export type CommentVoteType = 'up' | 'down';
export type CommentMetadata = { author: string; votes: Record<CommentVoteType, string[]> };
export type Comment = CommentDetailFragment & {
	metadataCommentId?: string;
	metadata?: CommentMetadata;
};

export type KitFeedbackRouter = {
	route: Route;
	params?: Record<string, any>;
	from: { route: Route; params?: Record<string, any> }[];
};

export type KitFeedbackTheme = {
	extend?: Partial<Record<Class, string>>;
	override?: Partial<Record<Class, string>>;
	default?: Record<Class, string>;
};

export type Routable = Readable<KitFeedbackRouter> & {
	goto: (route: Route, params?: Record<string, any>, replace?: boolean) => void;
	previous: () => void;
};

export type Overridable<T> = Readable<T> & { override: (overrides: T) => void };

export const routable = (route: Route): Routable => {
	const store = writable<KitFeedbackRouter>({ route, params: {}, from: [] });
	const goto = (route: Route, params: Record<string, any> = {}, replace = false) => {
		store.update((value) => ({
			route,
			params,
			from: replace ? value.from : [...value.from, { route: value.route, params: value.params }]
		}));
	};
	const previous = () => {
		store.update((value) => {
			const { route, params } = value.from.pop() ?? {};
			return { route, params, from: value.from };
		});
	};
	return { goto, previous, subscribe: store.subscribe };
};

export const overridable = <T>(initialValue: T) => {
	const { update, subscribe } = writable<T>(initialValue);
	const override = (overrides: T) => update((value: T) => merge(value, overrides));
	return { override, subscribe };
};
