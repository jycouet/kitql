<script lang="ts">
  import { page } from '$app/state'
</script>

<h2>site [id]</h2>

<pre>id: {page.params.id}</pre>
<pre>da-sh: {page.url.searchParams.get('da-sh')}</pre>
