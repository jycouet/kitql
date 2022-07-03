<script lang="ts">
	import type { userInfo$data } from '$houdini';

	export let userInfo: userInfo$data | null = null;
</script>

{#if userInfo}
	<a href={`/${userInfo?.login}`}>
		<img
			height="77px"
			width="77px"
			style="border-radius: 14px"
			src={userInfo?.avatarUrl}
			alt={`Profile pic of ${userInfo?.name}!`}
		/>
	</a>
{:else}
	No data!
{/if}
