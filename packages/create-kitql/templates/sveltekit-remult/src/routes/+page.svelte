<script lang="ts">
  import { remult } from 'remult'
  import { onDestroy, onMount } from 'svelte'
  import { Task, TasksController } from '../shared'

  let list: Task[] = []
  let unSub: (() => void) | null = null

  let title = ''

  onMount(async () => {
    unSub = remult
      .repo(Task)
      .liveQuery()
      .subscribe(info => {
        list = info.applyChanges(list)
      })
  })

  onDestroy(() => {
    unSub && unSub()
  })

  const add = async () => {
    try {
      await remult.repo(Task).insert({ title })
      title = ''
    } catch (error) {
      alert((error as { message: string }).message)
    }
  }

  const update = async (task: Task) => {
    await remult.repo(Task).save({ ...task, completed: !task.completed })
  }
</script>

<h2>Home</h2>

<ul>
  {#each list as task}
    <li>
      <button
        style={task.completed ? 'text-decoration: line-through;color:green' : ''}
        on:click={() => update(task)}
      >
        {task.title}
      </button>
    </li>
  {/each}
</ul>

<form on:submit|preventDefault={add}>
  <input type="text" bind:value={title} />
  <button type="submit">Add</button>
</form>
<button
  on:click={async () =>
    await TasksController.setAllCompleted(list.length > 0 ? !list[0].completed : false)}>All</button
>
