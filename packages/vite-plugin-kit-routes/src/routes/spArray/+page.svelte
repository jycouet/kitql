<script lang="ts">
  import { page } from '$app/stores'

  const ids: number[] = $page.url.searchParams.getAll('ids')?.map(id => parseInt(id)) ?? []
</script>

<h2>Array Search Params</h2>

<pre>{JSON.stringify(ids)}</pre>
