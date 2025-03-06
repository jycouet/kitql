// import { SP } from "$lib/index.js";
import type { PageLoad } from './$types.js'

export const load = (async (event) => {
  const kind = event.params.kind ?? 'undef'

  return {
    kind,
    // params: new SP({ name: kind, age: 25, active: true })
  }
}) satisfies PageLoad
