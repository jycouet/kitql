<script lang="ts">
let { children } = $props()
</script>

<p class="cool">Not so nice...</p>
<br />
{@render children?.()}

<style>
  .cool {
    color: red;
  }
</style>
