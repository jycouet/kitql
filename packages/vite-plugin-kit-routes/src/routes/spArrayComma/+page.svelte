<script lang="ts">
  import { page } from '$app/stores'
  const ids: number[] =
    $page.url.searchParams
      .get('ids')
      ?.split(',')
      ?.map(id => parseInt(id)) ?? []
</script>

<h2>Array Search Params (comma-separated)</h2>

<pre>{JSON.stringify(ids)}</pre>
