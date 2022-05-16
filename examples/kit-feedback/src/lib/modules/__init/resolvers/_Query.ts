import { getReleaseCreatedAtUtc } from '../providers/BlVersion';
import type { __InitModule } from '../_kitql/moduleTypes';

export const resolvers: __InitModule.Resolvers = {
	Query: {
		version: async (_root, _args) => {
			return {
				releaseCreatedAtUtc: getReleaseCreatedAtUtc()
			};
		}
	}
};
