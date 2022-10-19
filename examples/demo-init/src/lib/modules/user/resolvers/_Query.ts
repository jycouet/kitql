import type { UserConnection } from '$graphql/$kitql/graphqlTypes';
import { rootFields } from '@kitql/all-in';
import type { UserModule } from '../$kitql/moduleTypes';

export const resolvers: UserModule.Resolvers = {
	Query: {
		user: async (root, args, ctx) => {
			return {
				id: ctx.user.id.toString(),
				username: ctx.user.name
			};
		},

		userConnection: async (root, args, ctx, info) => {
			const fields = rootFields(info);
			const toReturn: UserConnection = {
				__typename: 'UserConnection',
				edges: null,
				pageInfo: null,
				totalCount: null
			};
			if (fields.includes('edges')) {
				toReturn.edges = [
					{
						cursor: '123',
						node: {
							id: '1',
							username: 'JYC'
						}
					}
				];
			}
			if (fields.includes('pageInfo')) {
				toReturn.pageInfo = {
					hasNextPage: true,
					hasPreviousPage: true,
					startCursor: '123',
					endCursor: '123'
				};
			}
			if (fields.includes('totalCount')) {
				toReturn.totalCount = 1;
			}
			return toReturn;
		}
	}
};
