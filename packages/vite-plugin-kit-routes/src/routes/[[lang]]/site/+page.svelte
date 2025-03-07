<script>
	import { page } from '$app/stores'
</script>

<h2>Sites</h2>

<pre>limit: {$page.url.searchParams.get('limit')}</pre>
