import { describe, expect, it } from 'vitest'

import { getFilesUnder } from './fs.js'

describe('fs', () => {
  it('getFilesUnder', async () => {
    const location = `${process.cwd()}/src/routes/`
    expect(getFilesUnder(location)).toMatchInlineSnapshot(`
      [
        "(rootGroup)/subGroup/+page.svelte",
        "(rootGroup)/subGroup2/+page.svelte",
        "+layout.svelte",
        "+page.svelte",
        "[[lang]]/contract/+page.svelte",
        "[[lang]]/contract/+server.ts",
        "[[lang]]/contract/[id]/+page.server.ts",
        "[[lang]]/contract/[id]/+page.svelte",
        "[[lang]]/gp/(logged)/one/+page.svelte",
        "[[lang]]/gp/(public)/two/+page.svelte",
        "[[lang]]/main/+page.svelte",
        "[[lang]]/match/[id=int]/+page.svelte",
        "[[lang]]/site/+page.server.ts",
        "[[lang]]/site/+page.svelte",
        "[[lang]]/site/+server.ts",
        "[[lang]]/site/[id]/+page.svelte",
        "[[lang]]/site_contract/[siteId]-[contractId]/+page.server.ts",
        "[[lang]]/site_contract/[siteId]-[contractId]/+page.svelte",
        "a/[...rest]/z/+page.svelte",
        "api/graphql/+server.ts",
        "page_server_woAction/+page.server.ts",
      ]
    `)
  })
})
