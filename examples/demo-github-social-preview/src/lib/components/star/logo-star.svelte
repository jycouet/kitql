<script lang="ts">
	export let filled = false;
</script>

<svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" viewBox="0 0 24 24"
	><path
		d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"
		fill={filled ? '#e3b341' : 'transparent'}
	/></svg
>

<style>
	path {
		stroke: #161b22;
		stroke-width: 1.5px;
	}

	path:hover {
		/* fill: #e3b341; */
		stroke: #faeac6;
		cursor: pointer;
	}
</style>
