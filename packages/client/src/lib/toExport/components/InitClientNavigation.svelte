<script lang="ts">
	// Todo: https://github.com/sveltejs/kit/issues/4048#issuecomment-1073577686
	import { afterNavigate } from '$app/navigation';
	import { setClientNavigation } from '@kitql/client';

	afterNavigate(() => setClientNavigation());
</script>
