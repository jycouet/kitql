<script lang="ts">
  import { debounce, SP } from '$lib/index.js'

  // Define search parameters and their types
  const params = new SP(
    { name: 'plop', age: 25, active: true },
    // { config: { name: { debounce: 2000 } } },
  )
</script>

<div class="container mx-auto p-6">
  <h1 class="mb-6 text-3xl font-bold">Search Parameters Example (Simplified)</h1>

  <div class="card bg-base-200 mb-6 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Form Fields (Auto-Synced to URL)</h2>

      <div class="form-control mb-4 w-full max-w-xs">
        <label for="name" class="label">
          <span class="label-text">Name</span>
        </label>
        <input
          type="text"
          bind:value={() => params.sp.name, debounce((v) => (params.sp.name = v), 500)}
          placeholder="Enter your name"
          class="input input-bordered w-full max-w-xs"
        />
        <!-- bind:value={sp.name} -->
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
