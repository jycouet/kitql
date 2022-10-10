<script context="module" lang="ts">
	import { GQL_Version } from '$houdini';
	import type { LoadEvent } from '@sveltejs/kit';

	export async function load(event: LoadEvent) {
		await GQL_Version.fetch({ event });
		return {};
	}
</script>

<div>✅ Your #GraphQL endpoint on SvelteKit is working 👌</div>
<div>
	✅ Your first query - <b>Version</b>:
	<pre>{$GQL_Version.data?.version.releaseCreatedAtUtc.toISOString()}</pre>
	<pre>{$GQL_Version.data?.version.releaseCreatedAtUtc.toLocaleDateString() +
			' ' +
			$GQL_Version.data?.version.releaseCreatedAtUtc.toLocaleTimeString()}</pre>
</div>
<div>
	✅ Your own 👉 <a href="/api/playql" target="_blank" rel="external">Graph<i>i</i>QL</a>
</div>
<br />
<hr />
<br />
<br />
<br />
<br />
<div>
	🧘‍♂️ All this using 👉 <a
		href="https://www.the-guild.dev/blog/announcing-graphql-yoga-2"
		target="_blank">GraphQL Yoga 2</a
	> 🚀
</div>

<style>
	div {
		margin-left: 10px;
		margin-top: 20px;
	}
	pre {
		margin-left: 40px;
		width: 300px;
		padding: 10px 10px 10px 10px;
		background-color: black;
	}
</style>
