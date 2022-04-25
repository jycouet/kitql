<script lang="ts">
	import type { UserInfoFragment } from '$lib/graphql/_kitql/graphqlTypes';

	export let userInfo: UserInfoFragment | null = null;
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
