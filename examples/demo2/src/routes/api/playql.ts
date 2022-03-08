import { renderGraphiQL } from '@graphql-yoga/common';

const defaultQuery = `query Version {
  version {
    releaseCreatedAtUtc
  }
}
`;

export async function get() {
	return {
		status: 200,
		headers: {
			'Content-Type': 'text/html'
		},
		body: renderGraphiQL({
			title: 'Yoga KitQL',
			defaultVariableEditorOpen: false,
			endpoint: '/api/graphql',
			defaultQuery
		})
	};
}
