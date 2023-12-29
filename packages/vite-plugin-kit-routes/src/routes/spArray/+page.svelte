<script lang="ts">
  import { page } from '$app/stores'

  const ids: number[] =
    $page.url.searchParams
      .get('ids')
      ?.split(',')
      ?.map(id => parseInt(id)) ?? []
</script>

<h2>Search Params (Array)</h2>

<pre>{ids}</pre>
