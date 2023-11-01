<script lang="ts">
  import { enhance } from '$app/forms'
  import { ACTIONS } from '$lib/ROUTES.js'

  export let form

  const action = ACTIONS.site_contract_siteId_contractId('sendSomething', {
    siteId: 'Paris',
    contractId: 'First',
  })
</script>

<h2>Site & Contract [siteId] - [Contract]</h2>
<form method="POST" use:enhance {action}>
  Action used: <pre>{action}</pre>
  <button>Check</button>
</form>

<pre>{JSON.stringify(form)}</pre>
