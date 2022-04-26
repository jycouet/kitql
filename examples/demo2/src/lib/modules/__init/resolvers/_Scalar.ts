import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import type { __InitModule } from '../_kitql/moduleTypes';

export const resolvers: __InitModule.Resolvers = {
	Date: DateResolver,
	DateTime: DateTimeResolver
};
