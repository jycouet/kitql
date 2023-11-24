<script lang="ts">
	import { remult } from 'remult';
	import { onMount } from 'svelte';
	import { Task } from '../shared';

	let list: Task[] = [];

	onMount(async () => {
		list = await remult.repo(Task).find();
	});
</script>

<h2>Home</h2>

<ul>
	{#each list as task}
		<li>{task.title}</li>
	{/each}
</ul>
