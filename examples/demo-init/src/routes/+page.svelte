<script lang="ts">
	import { graphql } from '$houdini';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Version } = data);

	const updates = graphql(`
		subscription Countdown($from: Int!) {
			countdown(from: $from)
		}
	`);

	$: updates.listen({ from: 360 });
</script>

<div>✅ #GraphQL is working 👌</div>

<div>
	✅ Check your own 👉 <a
		href="/api/graphiql?query=%23+Welcome+to+KitQL%0A%0Aquery+Version+%7B%0A++version+%7B%0A++++releaseCreatedAtUtc%0A++%7D%0A%7D"
		target="_blank"
		rel="external">Graph<i>i</i>QL</a
	> <i>v2</i>!
</div>

<div>
	✅ Your first query 👇
	<pre>{$Version.data?.version.releaseCreatedAtUtc.toISOString()}</pre>
	<pre>{$Version.data?.version.releaseCreatedAtUtc.toLocaleDateString() +
			' ' +
			$Version.data?.version.releaseCreatedAtUtc.toLocaleTimeString()}</pre>
</div>

<div>
	✅ Your first subscription 👇
	<pre>{JSON.stringify($updates, null, 2)}</pre>
</div>

<style>
	div {
		font-size: medium;
		margin-left: 0.5rem;
		margin-top: 1rem;
	}
	pre {
		margin-left: 0.5rem;
		padding: 10px 10px 10px 10px;
		background-color: black;
	}
</style>
