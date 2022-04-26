import { renderGraphiQL } from '@graphql-yoga/common';

const defaultQuery = `query Version {
  version {
    releaseCreatedAtUtc
  }
}

mutation Boost {
  _boostServer
}

mutation GenerateError {
	_generateError
}`;

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
