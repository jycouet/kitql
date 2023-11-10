<script lang="ts">
  import { page } from '$app/stores'
  import { PAGES } from '$lib/ROUTES.js'

  const list = [
    { lang: 'fr', caption: 'Français' },
    { lang: 'en', caption: 'English' },
    { lang: 'at', caption: 'Deutsch' },
  ].map(c => {
    return { ...PAGES.lang({ lang: c.lang }), ...c }
  })
</script>

<h2>Home <em>({$page.params.lang})</em></h2>

<ul>
  {#each list as { href, caption }}
    <li>
      <a {href}>{caption}</a>
    </li>
  {/each}
</ul>
