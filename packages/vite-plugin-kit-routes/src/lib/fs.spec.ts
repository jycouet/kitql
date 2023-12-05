import { describe, expect, it } from 'vitest'

import { getFilesUnder } from './fs.js'
import { rmvGroups, rmvOptional } from './plugin.js'

describe('fs', () => {
  it('getFilesUnder', async () => {
    const location = `${process.cwd()}/src/routes/`
    expect(getFilesUnder(location)).toMatchInlineSnapshot(`
      [
        "(rootGroup)/+page.svelte",
        "(rootGroup)/subGroup/(anotherSub)/user/+page.svelte",
        "(rootGroup)/subGroup/+page.svelte",
        "(rootGroup)/subGroup2/+page.svelte",
        "+layout.svelte",
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
        "[[lang]]/site/[id]/+page.server.ts",
        "[[lang]]/site/[id]/+page.svelte",
        "[[lang]]/site_contract/+page.server.ts",
        "[[lang]]/site_contract/[siteId]-[contractId]/+page.server.ts",
        "[[lang]]/site_contract/[siteId]-[contractId]/+page.svelte",
        "a/[...rest]/z/+page.svelte",
        "api/graphql/+server.ts",
        "data/errors/[locale].json/+server.ts",
        "lay/(layVerySpecial)/+layout.svelte",
        "lay/(layVerySpecial)/normal/+page.svelte",
        "lay/(layVerySpecial)/root-layout/+page@.svelte",
        "lay/(layVerySpecial)/skip/+page@lay.svelte",
        "lay/+layout.svelte",
        "page_server_woAction/+page.server.ts",
        "sp/+page.svelte",
      ]
    `)
  })
})

describe('rmv Helper', () => {
  it('rmvOptional', async () => {
    const location = `${process.cwd()}/src/routes/`
    expect(getFilesUnder(location).map(c => rmvOptional(c))).toMatchInlineSnapshot(`
      [
        "(rootGroup)/+page.svelte",
        "(rootGroup)/subGroup/(anotherSub)/user/+page.svelte",
        "(rootGroup)/subGroup/+page.svelte",
        "(rootGroup)/subGroup2/+page.svelte",
        "+layout.svelte",
        "/contract/+page.svelte",
        "/contract/+server.ts",
        "/contract/[id]/+page.server.ts",
        "/contract/[id]/+page.svelte",
        "/gp/(logged)/one/+page.svelte",
        "/gp/(public)/two/+page.svelte",
        "/main/+page.svelte",
        "/match/[id=int]/+page.svelte",
        "/site/+page.server.ts",
        "/site/+page.svelte",
        "/site/+server.ts",
        "/site/[id]/+page.server.ts",
        "/site/[id]/+page.svelte",
        "/site_contract/+page.server.ts",
        "/site_contract/[siteId]-[contractId]/+page.server.ts",
        "/site_contract/[siteId]-[contractId]/+page.svelte",
        "a/[...rest]/z/+page.svelte",
        "api/graphql/+server.ts",
        "data/errors/[locale].json/+server.ts",
        "lay/(layVerySpecial)/+layout.svelte",
        "lay/(layVerySpecial)/normal/+page.svelte",
        "lay/(layVerySpecial)/root-layout/+page@.svelte",
        "lay/(layVerySpecial)/skip/+page@lay.svelte",
        "lay/+layout.svelte",
        "page_server_woAction/+page.server.ts",
        "sp/+page.svelte",
      ]
    `)
  })

  it('rmvGroups with multi groups', async () => {
    expect(rmvGroups('/(rootGroup)/subGroup/(anotherSub)/user')).toBe('/subGroup/user')
  })

  it('rmvGroups', async () => {
    const location = `${process.cwd()}/src/routes/`
    expect(getFilesUnder(location)).toMatchInlineSnapshot(`
      [
        "(rootGroup)/+page.svelte",
        "(rootGroup)/subGroup/(anotherSub)/user/+page.svelte",
        "(rootGroup)/subGroup/+page.svelte",
        "(rootGroup)/subGroup2/+page.svelte",
        "+layout.svelte",
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
        "[[lang]]/site/[id]/+page.server.ts",
        "[[lang]]/site/[id]/+page.svelte",
        "[[lang]]/site_contract/+page.server.ts",
        "[[lang]]/site_contract/[siteId]-[contractId]/+page.server.ts",
        "[[lang]]/site_contract/[siteId]-[contractId]/+page.svelte",
        "a/[...rest]/z/+page.svelte",
        "api/graphql/+server.ts",
        "data/errors/[locale].json/+server.ts",
        "lay/(layVerySpecial)/+layout.svelte",
        "lay/(layVerySpecial)/normal/+page.svelte",
        "lay/(layVerySpecial)/root-layout/+page@.svelte",
        "lay/(layVerySpecial)/skip/+page@lay.svelte",
        "lay/+layout.svelte",
        "page_server_woAction/+page.server.ts",
        "sp/+page.svelte",
      ]
    `)

    expect(getFilesUnder(location).map(c => rmvGroups(c))).toMatchInlineSnapshot(`
      [
        "/+page.svelte",
        "/subGroup/user/+page.svelte",
        "/subGroup/+page.svelte",
        "/subGroup2/+page.svelte",
        "+layout.svelte",
        "[[lang]]/contract/+page.svelte",
        "[[lang]]/contract/+server.ts",
        "[[lang]]/contract/[id]/+page.server.ts",
        "[[lang]]/contract/[id]/+page.svelte",
        "[[lang]]/gp/one/+page.svelte",
        "[[lang]]/gp/two/+page.svelte",
        "[[lang]]/main/+page.svelte",
        "[[lang]]/match/[id=int]/+page.svelte",
        "[[lang]]/site/+page.server.ts",
        "[[lang]]/site/+page.svelte",
        "[[lang]]/site/+server.ts",
        "[[lang]]/site/[id]/+page.server.ts",
        "[[lang]]/site/[id]/+page.svelte",
        "[[lang]]/site_contract/+page.server.ts",
        "[[lang]]/site_contract/[siteId]-[contractId]/+page.server.ts",
        "[[lang]]/site_contract/[siteId]-[contractId]/+page.svelte",
        "a/[...rest]/z/+page.svelte",
        "api/graphql/+server.ts",
        "data/errors/[locale].json/+server.ts",
        "lay/+layout.svelte",
        "lay/normal/+page.svelte",
        "lay/root-layout/+page@.svelte",
        "lay/skip/+page@lay.svelte",
        "lay/+layout.svelte",
        "page_server_woAction/+page.server.ts",
        "sp/+page.svelte",
      ]
    `)
  })

  it('rmvGroups & Optional', async () => {
    const location = `${process.cwd()}/src/routes/`
    expect(getFilesUnder(location).map(c => rmvGroups(rmvOptional(c)))).toMatchInlineSnapshot(`
      [
        "/+page.svelte",
        "/subGroup/user/+page.svelte",
        "/subGroup/+page.svelte",
        "/subGroup2/+page.svelte",
        "+layout.svelte",
        "/contract/+page.svelte",
        "/contract/+server.ts",
        "/contract/[id]/+page.server.ts",
        "/contract/[id]/+page.svelte",
        "/gp/one/+page.svelte",
        "/gp/two/+page.svelte",
        "/main/+page.svelte",
        "/match/[id=int]/+page.svelte",
        "/site/+page.server.ts",
        "/site/+page.svelte",
        "/site/+server.ts",
        "/site/[id]/+page.server.ts",
        "/site/[id]/+page.svelte",
        "/site_contract/+page.server.ts",
        "/site_contract/[siteId]-[contractId]/+page.server.ts",
        "/site_contract/[siteId]-[contractId]/+page.svelte",
        "a/[...rest]/z/+page.svelte",
        "api/graphql/+server.ts",
        "data/errors/[locale].json/+server.ts",
        "lay/+layout.svelte",
        "lay/normal/+page.svelte",
        "lay/root-layout/+page@.svelte",
        "lay/skip/+page@lay.svelte",
        "lay/+layout.svelte",
        "page_server_woAction/+page.server.ts",
        "sp/+page.svelte",
      ]
    `)
  })
})
