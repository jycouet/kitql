import { createModule, InjectionToken } from 'graphql-modules';
import { get } from 'svelte/store';
import { DbGithub } from './providers/DbGithub';
import { config, createIssueLabelId, repositoryId, type KitFeedbackConfig } from './utils/config';
import { resolvers } from './_kitql/resolvers';
import { typeDefs } from './_kitql/typedefs';

export const KitFeedbackConfigIT = new InjectionToken<KitFeedbackConfig>('kit-feedback-config');
export const RepositoryIdIT = new InjectionToken<string>('repository-id');
export const CreateIssueLabelIdIT = new InjectionToken<string>('create-issue-label-id');

export const kitFeedbackModule = createModule({
	id: 'kit-feedback-module',
	typeDefs,
	resolvers,
	providers: [
		DbGithub,
		{ provide: KitFeedbackConfigIT, useFactory: () => get(config) },
		{
			provide: RepositoryIdIT,
			useFactory: () => 'R_kgDOGkDBjQ' //get(repositoryId)
		},
		{
			provide: CreateIssueLabelIdIT,
			useFactory: () => 'LA_kwDOGkDBjc7yAbx7' //get(createIssueLabelId)
		}
	],
	middlewares: {
		'*': {
			'*': []
		}
	}
});
