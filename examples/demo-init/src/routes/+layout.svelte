<svelte:head>
	<title>KitQL</title>
</svelte:head>

<h1 class="vAlign">Welcome to KitQL <img class="ml-1" src="./logo.svg" alt="logo KitQL" /></h1>

<p>
	Visit <a target="_blanck" href="https://github.com/jycouet/kitql">KitQL</a> Github to read the documentation
</p>

<hr />

<slot />

<style>
	:root {
		background-color: #0a1d41;
		color: #fff;
		font-size: x-large;
	}

	:global(a) {
		color: #ff3e00;
	}

	.vAlign {
		display: flex;
		align-items: center;
	}
	.ml-1 {
		margin-left: 1rem;
	}
</style>
