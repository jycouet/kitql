<svelte:head>
	<title>KitQL</title>
</svelte:head>

<h1 class="vAlign">
	Welcome

	<a target="_blanck" href="https://github.com/jycouet/kitql">
		<img src="./logo.svg" alt="logo KitQL" />
		<img
			src="https://raw.githubusercontent.com/jycouet/jycouet/main/img/GitHub-Light.png"
			alt="Github Logo"
		/>
	</a>
</h1>

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

	img {
		width: 50px;
	}

	a {
		margin-left: 1rem;
	}

	a,
	img {
		text-decoration-line: none;
	}

	.vAlign {
		display: flex;
		align-items: center;
	}
</style>
