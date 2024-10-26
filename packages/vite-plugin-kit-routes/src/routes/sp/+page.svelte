<script lang="ts">
  import { goto } from '$app/navigation'
  import { page } from '$app/stores'

  import { currentSp, route } from '$lib/ROUTES.js'

  const elves = [
    { name: 'Emma', tally: 32 },
    { name: 'Ethan', tally: 14 },
    { name: 'Isabella', tally: 70 },
    { name: 'Jayden', tally: -16 },
    { name: 'Isabella', tally: -59 },
    { name: 'Noah', tally: 19 },
    { name: 'Mia', tally: -37 },
    { name: 'Will', tally: -20 },
    { name: 'Sam', tally: -91 },
    { name: 'Brittney', tally: -98 },
  ]

  let take = $state(Number($page.url.searchParams.get('take') ?? 10))
  let skip = $state(Number($page.url.searchParams.get('skip') ?? 0))
  let search = $state($page.url.searchParams.get('search') ?? '')

  const updateUrl = async () => {
    const url = route('/sp', { ...currentSp(), search, skip, take })
    await goto(url, { keepFocus: true })
  }
</script>

<h2>Search Params</h2>

<label>
  Filter by name
  <input bind:value={search} onkeyup={updateUrl} placeholder="enter something" />
</label>
<label>
  Skip
  <input type="number" bind:value={skip} onkeyup={updateUrl} min="0" />
</label>
<label>
  Take
  <input type="number" bind:value={take} onkeyup={updateUrl} min="0" />
</label>

{#each elves.filter((c) => c.name.toLowerCase().includes(search)).splice(skip, take) as elve}
  <div>{elve.tally > 0 ? '✅' : '😳'} {elve.name}</div>
{/each}
