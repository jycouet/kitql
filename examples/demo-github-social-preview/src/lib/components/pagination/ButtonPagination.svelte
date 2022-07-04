<script lang="ts">
	import type { Followers$input, paginationInfo$data } from '$houdini';
	import { createEventDispatcher } from 'svelte';

	export let type: 'before' | 'after' = 'before';
	export let paginationInfo: paginationInfo$data | null = null;

	const dispatch = createEventDispatcher();

	function dispatchPaginate(data: Followers$input) {
		dispatch('paginate', {
			data
		});
	}

	function before() {
		dispatchPaginate({ last: 5, before: paginationInfo.startCursor });
	}

	function after() {
		dispatchPaginate({ first: 5, after: paginationInfo.endCursor });
	}
</script>

{#if paginationInfo && type === 'before'}
	<button on:click={before} disabled={!paginationInfo.hasPreviousPage}>before</button>
{/if}
{#if paginationInfo && type === 'after'}
	<button on:click={after} disabled={!paginationInfo.hasNextPage}>after</button>
{/if}
