<script lang="ts">
	import type { RequestResult } from '$lib/toExport';

	export let store: RequestResult<any, any>;
</script>

<table class="pre">
	<tr>
		<td />
		<td />
		<td style="text-align: right">KitQL Info</td>
	</tr>
	<tr>
		<td>From</td>
		<td><b>{store.from}</b></td>
	</tr>
	<tr>
		<td>Status</td>
		<td><b>{store.status}</b></td>
	</tr>
	<tr>
		<td>Date</td>
		<td><i>{new Date(store.date).toISOString()}</i></td>
	</tr>
	<tr>
		<td>Variables</td>
		<td>{JSON.stringify(store.variables)}</td>
	</tr>
</table>

<style>
	.pre {
		font-family: monospace;
		width: 100%;
		background-color: gray;
		padding: 0.5rem 0.5rem 0.5rem 0.5rem;
	}
</style>
