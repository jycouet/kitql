<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'

  import { route } from '$lib/ROUTES.js'

  export let form: FormData

  const id = $page.params.id

  const action = route('default /contract/[id]', {
    lang: $page.params.lang,
    id,
  })
</script>

<h2>Contract [ContractId]</h2>

<form method="POST" use:enhance {action}>
  Action used: <pre>{action}</pre>
  <button>Check</button>
</form>

<pre>{JSON.stringify(form)}</pre>
