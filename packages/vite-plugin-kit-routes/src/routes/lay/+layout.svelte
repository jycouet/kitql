<script>
let { children } = $props()
</script>

<p class="cool">Nice Layout...</p>
<br />
{@render children?.()}

<style>
  .cool {
    color: green;
  }
</style>
