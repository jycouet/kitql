<script lang="ts">
import { page } from '$app/stores'

let raw = $derived($page.url.searchParams.getAll('ids'))
let parsed = $derived(raw.map((id) => parseInt(id, 10)))
</script>

<h2>Array Search Params</h2>

<pre>{JSON.stringify({ raw, parsed }, null, 2)}</pre>
