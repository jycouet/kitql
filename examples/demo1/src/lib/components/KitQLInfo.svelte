<script>
	export let store;
</script>

<pre>
	
	<table style="width: 100%;">
		<tr>
			<td></td>
			<td></td>
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
</pre>

<style>
	pre {
		background-color: gray;
		padding: 0.5rem 0.5rem 0.5rem 0.5rem;
	}
</style>
