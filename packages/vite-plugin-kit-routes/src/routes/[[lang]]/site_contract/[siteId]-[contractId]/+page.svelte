<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'
  import { ACTIONS, kitRoutes } from '$lib/ROUTES.js'

  export let form: FormData

  const siteId = $page.params.siteId
  const contractId = $page.params.contractId

  // 🤞 before, random string
  // const action =  `/site_contract/${siteId}-${contractId}?/sendSomething`

  // ✅ after, all typed & make sure it exist. // 'vite-plugin-kit-routes',
  const action = ACTIONS.lang_site_contract_siteId_contractId('sendSomething', {
    lang: $kitRoutes.lang,
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
