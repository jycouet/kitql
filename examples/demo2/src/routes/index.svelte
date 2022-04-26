<script context="module" lang="ts">
	import { KQL_Version } from '$lib/graphql/_kitql/graphqlStores';
	import { KitQLInfo } from '@kitql/all-in';

	export async function load({ fetch, url, params, session, stuff }) {
		await KQL_Version.queryLoad({ fetch });
		return {};
	}
</script>

<KitQLInfo store={KQL_Version} />

<div>✅ Your #GraphQL endpoint on SvelteKit is working 👌</div>
<div>
	✅ Your first query - <b>Version</b>:
	<pre>{$KQL_Version.data?.version.releaseCreatedAtUtc}</pre>
</div>
<div>
	✅ Your own 👉 <a href="/api/playql" target="_blank" rel="external">Graph<i>i</i>QL</a>
</div>
<br />
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
