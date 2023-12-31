<script lang="ts">
  import { page } from '$app/stores'

  $: raw = $page.url.searchParams.getAll('ids')
  $: parsed = raw.map(id => parseInt(id, 10))
</script>

<h2>Array Search Params</h2>

<pre>{JSON.stringify({ raw, parsed }, null, 2)}</pre>
