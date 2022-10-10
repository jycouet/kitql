<script lang="ts">
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Version } = data);
</script>

<div>✅ Your #GraphQL endpoint on SvelteKit is working 👌</div>

<div>
	✅ Your first query - <b>Version</b>:
	<pre>{$Version.data?.version.releaseCreatedAtUtc.toISOString()}</pre>
	<pre>{$Version.data?.version.releaseCreatedAtUtc.toLocaleDateString() +
			' ' +
			$Version.data?.version.releaseCreatedAtUtc.toLocaleTimeString()}</pre>
</div>
<div>
	✅ Your own 👉 <a
		href="/graphiql?query=%23+Welcome+to+KitQL%0A%0Aquery+Version+%7B%0A++version+%7B%0A++++releaseCreatedAtUtc%0A++%7D%0A%7D"
		target="_blank"
		rel="external">Graph<i>i</i>QL</a
	>
</div>
<br />

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
