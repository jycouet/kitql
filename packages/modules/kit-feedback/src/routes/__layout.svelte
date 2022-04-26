<script lang="ts" context="module">
	import { client } from '$lib';

	export const load = async () => {
		client.initialize({ token: process.env.GITHUB_API_TOKEN });
		return {};
	};
</script>

<slot />
