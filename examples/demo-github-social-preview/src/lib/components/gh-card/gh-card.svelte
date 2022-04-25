<script lang="ts">
	import { KQL_AddStar, KQL_UserBestRepo } from '$lib/graphql/_kitql/graphqlStores';
	import type { UserBestRepoInfoFragment } from '$lib/graphql/_kitql/graphqlTypes';
	import html2canvas from 'html2canvas';
	import GhImg from '../gh-img/gh-img.svelte';
	import GhRepoLanguages from '../gh-repo-languages/gh-repo-languages.svelte';
	import GhStar from '../star/gh-star.svelte';

	export let userBestRepoInfo: UserBestRepoInfoFragment | null = null;

	async function wrongAdd(id: string) {
		// Pre patch guessing 999!
		const tmpStore = $KQL_UserBestRepo.data;
		tmpStore.user.repositories.nodes[0].viewerHasStarred = true;
		tmpStore.user.repositories.nodes[0].stargazers.totalCount = 999;
		KQL_UserBestRepo.patch(tmpStore);

		// Mutation
		const result = await KQL_AddStar.mutate({ variables: { id } });

		// Post patch
		tmpStore.user.repositories.nodes[0].viewerHasStarred =
			result.data.addStar.starrable.viewerHasStarred;
		tmpStore.user.repositories.nodes[0].stargazers.totalCount =
			result.data.addStar.starrable.stargazers.totalCount;
		KQL_UserBestRepo.patch(tmpStore);
	}

	async function dl() {
		const canvas = await html2canvas(document.querySelector('#card'), {
			backgroundColor: null,
			allowTaint: true,
			useCORS: true,
			logging: true
		});
		canvas.style.display = 'none';
		document.body.appendChild(canvas);
		const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
		const a = document.createElement('a');
		a.setAttribute('download', `gh-template.png`);
		a.setAttribute('href', image);
		a.click();
	}
</script>

{#if userBestRepoInfo}
	<div id="card" class="card">
		<div class="container">
			<div class="row">
				<a
					style="color: inherit;text-decoration: inherit;"
					target="_blanck"
					href={`https://github.com/${userBestRepoInfo.login}/${userBestRepoInfo.repositories.nodes[0].name}`}
					>{userBestRepoInfo.login} / <b>{userBestRepoInfo.repositories.nodes[0].name}</b></a
				>
				<div>
					<GhImg userInfo={userBestRepoInfo} />
				</div>
			</div>
			<div class="desc">
				{userBestRepoInfo.repositories.nodes[0].description ?? 'No description'}
			</div>
			<div class="row">
				<GhStar
					id={userBestRepoInfo.repositories.nodes[0].id}
					starInfo={userBestRepoInfo.repositories.nodes[0]}
				/>
			</div>

			<GhRepoLanguages languagesInfo={userBestRepoInfo.repositories.nodes[0]} />
		</div>
	</div>
{/if}

<div class="dlBtn">
	<button on:click={() => wrongAdd(userBestRepoInfo.repositories.nodes[0].id)}
		>Wrong Optimistic UI ADD</button
	>
	<button on:click={dl}>Download</button>
</div>

<style>
	.container {
		height: 250px;
		padding: 30px 40px 40px 40px;
	}

	.desc {
		font-style: italic;
		font-size: small;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.dlBtn {
		margin-top: 40px;
		text-align: center;
		width: 100%;
	}

	.row {
		height: 45%;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		gap: 40px;
	}

	.card {
		margin: 0px auto 0px auto;
		width: 640px;
		height: 320px;
		border-radius: 15px;
		background-color: #babbbd;
		color: #0d1117;
		font-size: xx-large;
		font-family: 'Courier New', Courier, monospace;
		box-shadow: rgba(186, 187, 189, 0.4) 0px 2px 4px, rgba(186, 187, 189, 0.3) 0px 7px 13px -3px,
			rgba(186, 187, 189, 0.2) 0px -3px 0px inset;
	}
</style>
