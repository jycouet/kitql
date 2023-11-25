import { describe, expect, it } from 'vitest'

import { getFilesUnder } from './fs.js'

describe('fr', () => {
  it('getFilesUnder', async () => {
    expect(getFilesUnder(`${process.cwd()}/src/routes`).map(c => c.replace(process.cwd(), '')))
      .toMatchInlineSnapshot(`
        [
          "/src/routes/(rootGroup)/subGroup/+page.svelte",
          "/src/routes/(rootGroup)/subGroup2/+page.svelte",
          "/src/routes/+layout.svelte",
          "/src/routes/+page.svelte",
          "/src/routes/[[lang]]/contract/+page.svelte",
          "/src/routes/[[lang]]/contract/+server.ts",
          "/src/routes/[[lang]]/contract/[id]/+page.server.ts",
          "/src/routes/[[lang]]/contract/[id]/+page.svelte",
          "/src/routes/[[lang]]/gp/(logged)/one/+page.svelte",
          "/src/routes/[[lang]]/gp/(public)/two/+page.svelte",
          "/src/routes/[[lang]]/main/+page.svelte",
          "/src/routes/[[lang]]/match/[id=int]/+page.svelte",
          "/src/routes/[[lang]]/site/+page.server.ts",
          "/src/routes/[[lang]]/site/+page.svelte",
          "/src/routes/[[lang]]/site/+server.ts",
          "/src/routes/[[lang]]/site/[id]/+page.svelte",
          "/src/routes/[[lang]]/site_contract/[siteId]-[contractId]/+page.server.ts",
          "/src/routes/[[lang]]/site_contract/[siteId]-[contractId]/+page.svelte",
          "/src/routes/a/[...rest]/z/+page.svelte",
          "/src/routes/api/graphql/+server.ts",
          "/src/routes/page_server_woAction/+page.server.ts",
        ]
      `)
  })
})
