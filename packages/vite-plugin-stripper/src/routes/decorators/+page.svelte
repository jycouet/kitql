<script lang="ts">
  import { ActionsController } from '../../shared/actionsController.js'

  let secretContent = $state('???')

  $effect(() => {
    ActionsController.read(true).then((content) => {
      secretContent = content
    })
  })
</script>

<h2>Bye bye decorators</h2>
secretContent: {secretContent}
