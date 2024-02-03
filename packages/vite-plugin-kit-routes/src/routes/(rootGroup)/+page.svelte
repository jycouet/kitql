<script lang="ts">
  import { route } from '$lib/ROUTES.js'

  const list = [
    { lang: 'fr', caption: 'Français' },
    { lang: 'en', caption: 'English' },
    { lang: 'hu', caption: 'Magyar' },
    { lang: 'at', caption: 'Deutsch' },
  ].map((c) => {
    return { href: route('/main', { lang: c.lang }), ...c }
  })
</script>

<h2>Home</h2>

<ul>
  {#each list as { href, caption }}
    <li>
      <a {href}>{caption}</a>
    </li>
  {/each}
</ul>
