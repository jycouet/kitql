<script lang="ts">
  import { untrack } from 'svelte'

  import { page } from '$app/state'

  import { debounce, SP } from '$lib/index.js'

  // import type { PageProps } from './$types.js'

  // let { data }: PageProps = $props()
  const kind = $derived(page.params.kind ?? 'undef')

  const params = new SP(
    {
      // get name() {
      //   return kind
      // },
      name: 'kind',
      age: 25,
      active: true,
    },
    { config: { name: {} } },
  )

  // const params = $derived.by(() => {
  //   const kindTracked = kind
  //   // return new SP({ name: kindTracked, age: 25, active: true })
  //   return untrack(() => new SP({ name: kindTracked, age: 25, active: true }))
  // })

  // const params = $derived(data.params)
</script>

<div class="container mx-auto p-6">
  <h1 class="mb-6 text-3xl font-bold">Search Parameters Example (Simplified)</h1>

  <div>
    <a href="/sp/example">undef</a>
  </div>
  <div>
    <a href="/sp/example/k1">k1</a>
  </div>
  {kind}
  <!-- {data.kind} -->

  <div class="card bg-base-200 mb-6 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Form Fields (Auto-Synced to URL)</h2>

      <div class="form-control mb-4 w-full max-w-xs">
        <label for="name" class="label">
          <span class="label-text">Name</span>
        </label>
        <input
          type="text"
          bind:value={params.sp.name}
          placeholder="Enter your name"
          class="input input-bordered w-full max-w-xs"
        />
        <!-- bind:value={() => params.sp.name, debounce((v) => (params.sp.name = v), 500)} -->
      </div>

      <div class="form-control mb-4 w-full max-w-xs">
        <label for="age" class="label">
          <span class="label-text">Age</span>
        </label>
        <input
          type="number"
          bind:value={params.sp.age}
          min="0"
          max="120"
          class="input input-bordered w-full max-w-xs"
        />
      </div>

      <div class="form-control mb-6">
        <label class="label cursor-pointer">
          <span class="label-text">Active Status</span>
          <input type="checkbox" bind:checked={params.sp.active} class="toggle toggle-primary" />
        </label>
      </div>

      <div class="card-actions">
        <button class="btn btn-secondary" onclick={() => params.reset()}>Reset to Defaults</button>
      </div>
    </div>
  </div>

  <div class="card bg-base-200 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Current Values</h2>
      <pre class="bg-base-300 whitespace-pre-wrap rounded-lg p-4"><code>
{JSON.stringify(params.sp, null, 2)}
			</code></pre>
    </div>
  </div>
</div>
