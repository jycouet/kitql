<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import { ACTIONS } from '$lib/ROUTES.js'

  export let form: FormData

  const siteId = $page.params.siteId
  const contractId = $page.params.contractId

  // 🤞 before, hardcoded string, error prone
  // const action =  `/en/site_contract/${siteId}-${contractId}?/sendSomething`

  // ✅ after, typechecked route, no more errors
  const action = ACTIONS.lang_site_contract_siteId_contractId('sendSomething', {
    lang: $page.params.lang,
    siteId,
    contractId,
  })
</script>

<h2>Site & Contract [siteId] - [ContractId]</h2>

<form method="POST" use:enhance {action}>
  Action used: <pre>{action}</pre>
  <button>Check</button>
</form>

<pre>{JSON.stringify(form)}</pre>
