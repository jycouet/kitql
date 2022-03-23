<script context="module">
	/** @type {import('./index').Load} */
	export async function load({ fetch }) {
		await KQL_Me.queryLoad({ fetch });
		await KQL_Followers.queryLoad({ fetch, variables: { first: 5 } });
		return {};
	}
</script>

<script lang="ts">
	import Followers from '$lib/components/Followers.svelte';
	import GhImg from '$lib/components/gh-img/gh-img.svelte';
	import { KQL_Followers, KQL_Me } from '$lib/graphql/_kitql/graphqlStores';
	import { KitQLInfo } from '@kitql/comp';
</script>

<!-- Just for debugging -->
<KitQLInfo store={KQL_Me} />

<!-- Me infos -->
<div class="row">Me 👇</div>
<div class="row">
	<GhImg userInfo={$KQL_Me.data?.viewer} />
</div>

<!-- Followers infos -->
<Followers />

<style>
	.row {
		margin-top: 40px;
		margin-bottom: 40px;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
	}
</style>
