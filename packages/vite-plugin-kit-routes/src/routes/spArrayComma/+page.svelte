<script lang="ts">
  import { page } from '$app/stores'

  $: raw = $page.url.searchParams.get('ids')
  $: parsed = raw?.split(',').map((id) => parseInt(id, 10))
</script>

<h2>Array Search Params (comma-separated)</h2>

<pre>{JSON.stringify({ raw, parsed }, null, 2)}</pre>
