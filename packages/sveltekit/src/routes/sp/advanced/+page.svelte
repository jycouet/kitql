<script lang="ts">
  import { SP } from '$lib/index.js'

  const defaultFilter = { sortBy: 'date', order: 'desc', limit: 10 }
  // Define more complex search parameters
  const sp = new SP(
    {
      title: 'Advanced Example',
      count: 0,
      tags: ['svelte', 'typescript', 'url'],
      filters: defaultFilter,
    },
    {
      config: {
        // Basic types
        title: { type: 'string' },
        count: { type: 'number' },

        // Array type examples
        tags: {
          type: 'array',
        },

        // Object type example
        filters: {
          type: 'object',
          encode: (obj) => {
            return JSON.stringify(obj)
          },
          decode: (str) => {
            if (!str) return defaultFilter
            return JSON.parse(str)
          },
        },
      },
    },
  )

  // New tag input
  let newTag = $state('')
  // Available sort options
  const sortOptions = ['date', 'name', 'price', 'popularity']
  const orderOptions = ['asc', 'desc']

  // Add a new tag
  function addTag() {
    if (newTag && !sp.obj.tags.includes(newTag)) {
      sp.obj.tags = [...sp.obj.tags, newTag]
      newTag = ''
    }
  }

  // Remove a tag
  function removeTag(tag: string) {
    sp.obj.tags = sp.obj.tags.filter((t: string) => t !== tag)
  }

  // Increment counter
  function incrementCount() {
    sp.obj.count += 1
  }
</script>

<div class="container mx-auto p-6">
  <h1 class="mb-4 text-3xl font-bold">{sp.obj.title}</h1>
  <p class="text-base-content/70 mb-6">
    This example demonstrates the advanced features of the SP class, including array and object
    handling.
  </p>

  <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
    <!-- Basic Parameters -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Basic Parameters</h2>

        <div class="form-control mb-4 w-full">
          <label for="title" class="label">
            <span class="label-text">Title</span>
          </label>
          <input type="text" bind:value={sp.obj.title} class="input input-bordered w-full" />
        </div>

        <div class="form-control mb-4 w-full">
          <label for="count" class="label">
            <span class="label-text">Counter: {sp.obj.count}</span>
          </label>
          <button class="btn btn-primary" onclick={incrementCount}> Increment </button>
        </div>
      </div>
    </div>

    <!-- Array Parameter -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Tag Array</h2>

        <div class="form-control mb-4 w-full">
          <label for="newTag" class="label">
            <span class="label-text">Add Tag</span>
          </label>
          <div class="join w-full">
            <input
              type="text"
              bind:value={newTag}
              placeholder="Enter new tag"
              class="input input-bordered join-item w-full"
            />
            <button class="btn btn-primary join-item" onclick={addTag}> Add </button>
          </div>
        </div>

        <div class="mb-4 flex flex-wrap gap-2">
          {#each sp.obj.tags as tag}
            <div class="badge badge-lg gap-1 p-3">
              {tag}
              <button class="btn btn-ghost btn-xs" onclick={() => removeTag(tag)}> ✕ </button>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <!-- Object Parameter -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">Filter Object</h2>

        <div class="form-control mb-4 w-full">
          <label for="sortBy" class="label">
            <span class="label-text">Sort By</span>
          </label>
          <select class="select select-bordered w-full" bind:value={sp.obj.filters.sortBy}>
            {#each sortOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </div>

        <div class="form-control mb-4 w-full">
          <label for="order" class="label">
            <span class="label-text">Order</span>
          </label>
          <div class="join">
            {#each orderOptions as option}
              <input
                type="radio"
                name="order"
                value={option}
                checked={sp.obj.filters.order === option}
                onchange={() => (sp.obj.filters.order = option)}
                class="join-item btn"
              />
              <label for={option} class="join-item btn">
                {option === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </label>
            {/each}
          </div>
        </div>

        <div class="form-control mb-4 w-full">
          <label for="limit" class="label">
            <span class="label-text">Results Limit: {sp.obj.filters.limit}</span>
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            bind:value={sp.obj.filters.limit}
            class="range range-primary"
          />
          <div class="flex w-full justify-between px-2 text-xs">
            <span>5</span>
            <span>15</span>
            <span>25</span>
            <span>35</span>
            <span>45</span>
          </div>
          {JSON.stringify(sp.obj.filters)}
        </div>
      </div>
    </div>

    <!-- Current URL and Actions -->
    <div class="card bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">URL and Actions</h2>

        <div class="card-actions justify-end">
          <button class="btn btn-secondary" onclick={() => sp.reset()}> Reset All </button>
        </div>
      </div>
    </div>
  </div>
</div>
