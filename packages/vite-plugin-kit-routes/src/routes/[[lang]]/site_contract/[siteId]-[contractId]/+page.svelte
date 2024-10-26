<script lang="ts">
  import { enhance } from '$app/forms'
  import { page } from '$app/stores'

  import { route } from '$lib/ROUTES.js'

  interface Props {
    form: FormData;
  }

  let { form }: Props = $props();

  const siteId = $page.params.siteId
  const contractId = $page.params.contractId

  // 🤞 before, hardcoded string, error prone
  // const action =  `/en/site_contract/${siteId}-${contractId}?/send`

  // ✅ after, typechecked route, no more errors
  const action = route('send /site_contract/[siteId]-[contractId]', {
    lang: $page.params.lang,
    siteId,
    contractId,
    extra: 'A',
  })
</script>

<h2>Site & Contract [siteId] - [ContractId]</h2>

<form method="POST" use:enhance {action}>
  Action used: <pre>{action}</pre>
  <button>Check</button>
</form>

<pre>{JSON.stringify(form)}</pre>
