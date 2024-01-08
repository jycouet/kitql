<script lang="ts">
  import { onMount } from 'svelte'
  import { ActionsController } from '../../shared/actionsController.js'

  let secretContent = '???'

  onMount(async () => {
    secretContent = await ActionsController.read(true)
  })
</script>

<h2>Bye bye decorators</h2>
secretContent: {secretContent}
