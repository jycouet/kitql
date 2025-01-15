<script lang="ts">
  import { goto } from '$app/navigation'
</script>

<div class="mx-auto max-w-3xl p-6">
  <nav class="sticky top-0 mb-8 rounded-lg bg-gray-100 p-4">
    <button class="text-blue-600 hover:underline" on:click={() => goto('anchors#section1')}>
      Section 1
    </button>

    <button class="text-blue-600 hover:underline" on:click={() => goto('anchors#section2')}>
      Section 2
    </button>

    <button class="text-blue-600 hover:underline" on:click={() => goto('anchors#section3')}>
      Section 3
    </button>
  </nav>

  <section id="section1" class="mb-12">
    <h2 class="mb-4 text-2xl font-bold">Section 1</h2>
    <p class="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <p class="mb-4">
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
      mollit anim id est laborum.
    </p>
    <p class="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <p class="mb-4">
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
      mollit anim id est laborum.
    </p>
  </section>

  <section id="section2" class="mb-12">
    <h2 class="mb-4 text-2xl font-bold">Section 2</h2>
    <p class="mb-4">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
      laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
      beatae vitae dicta sunt explicabo.
    </p>
    <p class="mb-4">
      Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
      consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    </p>
    <p class="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <p class="mb-4">
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
      mollit anim id est laborum.
    </p>
  </section>

  <section id="section3" class="mb-12">
    <h2 class="mb-4 text-2xl font-bold">Section 3</h2>
    <p class="mb-4">
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
      voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati
      cupiditate non provident.
    </p>
    <p class="mb-4">
      Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
      Et harum quidem rerum facilis est et expedita distinctio.
    </p>
    <p class="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <p class="mb-4">
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
      mollit anim id est laborum.
    </p>
  </section>
</div>
