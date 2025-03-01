<script>
/**
 * @typedef {Object} Props
 * @property {import('svelte').Snippet} [children]
 */

/** @type {Props} */
let { children } = $props()
</script>

<svelte:head>
  <title>KitQL</title>
</svelte:head>

<h1 class="vAlign">
  Welcome to KitQL <img
    class="ml-1"
    src="https://raw.githubusercontent.com/jycouet/kitql/main/logo.svg"
    alt="logo KitQL"
    width="50"
  />
</h1>

<p>
  Visit <a target="_blanck" href="https://github.com/jycouet/kitql">Github KitQL</a> to read the documentation
</p>

<hr />

<center>
  <a href="/">Home</a>
</center>

{@render children?.()}

<style>
  :root {
    background-color: rgba(68, 68, 68, 0.1);
  }

  .vAlign {
    display: flex;
    align-items: center;
  }
  .ml-1 {
    margin-left: 1rem;
  }
</style>
