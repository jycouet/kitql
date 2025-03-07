<script lang="ts">
	import { page } from '$app/state'

	import { SP } from '$lib/index.js'

	const sel = [
		{ id: 1, name: 'car' },
		{ id: 2, name: 'bike' },
	]

	// let { data }: PageProps = $props()
	const kind = $derived(page.params.kind ?? 'undef')

	const sp = new SP<{
		name: string
		name2: string
		age: number
		active: boolean
		sel?: { id: number; name?: string }
	}>(
		{
			// get name() {
			//   return kind
			// },
			name: 'kind',
			name2: 'kind2',
			age: 25,
			active: true,
			sel: { id: 2 },
		},
		{
			config: {
				name: { debounce: true },
				name2: { debounce: 2777 },
				sel: {
					type: 'object',
					encode: (obj) => {
						return obj?.id?.toString() || undefined
					},
					decode: (str) => {
						if (!str) return undefined
						return sel.find((s) => s.id === Number(str))
					},
				},
			},
		},
	)

	// const params = $derived.by(() => {
	//   const kindTracked = kind
	//   // return new SP({ name: kindTracked, age: 25, active: true })
	//   return untrack(() => new SP({ name: kindTracked, age: 25, active: true }))
	// })

	// const params = $derived(data.params)
	// $inspect(sp.raw.sel)
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
					bind:value={sp.obj.name}
					placeholder="Enter your name"
					class="input input-bordered w-full max-w-xs"
				/>
				<!-- bind:value={() => params.sp.name, debounce((v) => (params.sp.name = v), 500)} -->
			</div>

			<div class="form-control mb-4 w-full max-w-xs">
				<label for="name" class="label">
					<span class="label-text">Name2</span>
				</label>
				<input
					type="text"
					bind:value={sp.obj.name2}
					placeholder="Enter your name"
					class="input input-bordered w-full max-w-xs"
				/>
			</div>

			<div class="form-control mb-4 w-full max-w-xs">
				<label for="age" class="label">
					<span class="label-text">Age</span>
				</label>
				<input
					type="number"
					bind:value={sp.obj.age}
					min="0"
					max="120"
					class="input input-bordered w-full max-w-xs"
				/>
			</div>

			<div class="form-control mb-6">
				<label class="label cursor-pointer">
					<span class="label-text">Active Status</span>
					<input type="checkbox" bind:checked={sp.obj.active} class="toggle toggle-primary" />
				</label>
			</div>

			{sp.rawStr.sel}
			<select bind:value={sp.rawStr.sel}>
				<option value="">-- Select an option --</option>
				{#each sel as item (item.id)}
					<option value={String(item.id)}>{item.name}</option>
				{/each}
			</select>

			<div class="card-actions">
				<button class="btn btn-secondary" onclick={() => sp.reset()}>Reset to Defaults</button>
			</div>
		</div>
	</div>

	<div class="card bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title">Current Values</h2>
			<pre class="bg-base-300 whitespace-pre-wrap rounded-lg p-4"><code>
{JSON.stringify(sp.computing, null, 2)}
{JSON.stringify(sp.obj, null, 2)}
			</code></pre>
		</div>
	</div>
</div>
