<script lang="ts">
	import type { languagesInfo$data } from '$houdini';

	export let languagesInfo: languagesInfo$data;

	function getPourcent(nodeSize: number) {
		return ((nodeSize * 100) / languagesInfo.languages.totalSize).toFixed();
	}
</script>

<div class="line">
	{#each languagesInfo.languages.edges as edge}
		<div
			title={`${edge.node.name} (${getPourcent(edge.size)}%)`}
			style={`background-color: ${edge.node.color}; height: 7px; width: ${getPourcent(
				edge.size
			)}%;`}
		/>
	{/each}
</div>

<style>
	.line {
		display: flex;
		background-color: #fff;
		cursor: pointer;
	}
</style>
