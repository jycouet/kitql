<script lang="ts">
import { page } from '$app/stores'

let raw = $derived($page.url.searchParams.get('ids'))
let parsed = $derived(raw?.split(',').map((id) => Number.parseInt(id, 10)))
</script>

<h2>Array Search Params (comma-separated)</h2>

<pre>{JSON.stringify({ raw, parsed }, null, 2)}</pre>
