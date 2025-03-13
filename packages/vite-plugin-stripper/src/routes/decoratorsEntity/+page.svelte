<script lang="ts">
	import { User } from '../../shared/User.js'

	let secretContent = $state('???')

	$effect(() => {
		User.hi(true).then((content) => {
			secretContent = content
		})
	})
</script>

<h2>Bye bye decorators</h2>
secretContent: {secretContent}
