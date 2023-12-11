import { describe, expect, it } from 'vitest'

import { getFilesUnder, read, write, relative } from './fs.js'

describe('fs', () => {
  it('getFilesUnder', async () => {
    const location = relative(`${process.cwd()}`, '../vite-plugin-kit-routes/src/routes/')
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
        "[[lang]]/match/[id=ab]/+page.svelte",
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

  it('read a file', async () => {
    const data = read(`${process.cwd()}/src/routes/+page.svelte`)
    expect(data).toMatchInlineSnapshot(`
      "<script lang=\\"ts\\">
        const strHref = 'www.google.com'
      </script>

      <h2>Home</h2>

      <div>Hello div</div>

      <a href=\\"www.google.com\\">Google</a>
      <a href={strHref}>Google</a>

      <img src=\\"test\\" alt=\\"test-1\\" />
      <p>
        <a href=\\"www.google.com\\">Google</a>
      </p>
      "
    `)
  })

  it('read no file', async () => {
    const data = read(`${process.cwd()}/src/routes/+page-NOOO.svelte`)
    expect(data).toMatchInlineSnapshot('null')
  })

  it('write file in a new place', async () => {
    const data = read(`${process.cwd()}/src/routes/+page.svelte`)
    if (data) {
      const path = `${process.cwd()}/node_modules/routes/+page.svelte` + new Date().toISOString()
      write(path, [data])
      const readAgainData = read(path)
      expect(readAgainData).toMatchInlineSnapshot(`
        "<script lang=\\"ts\\">
          const strHref = 'www.google.com'
        </script>

        <h2>Home</h2>

        <div>Hello div</div>

        <a href=\\"www.google.com\\">Google</a>
        <a href={strHref}>Google</a>

        <img src=\\"test\\" alt=\\"test-1\\" />
        <p>
          <a href=\\"www.google.com\\">Google</a>
        </p>
        "
      `)
    }
  })

  it('write file without any change', async () => {
    const data = read(`${process.cwd()}/src/routes/+page.svelte`)
    if (data) {
      write(`${process.cwd()}/src/routes/+page.svelte`, [data])
      const readAgainData = read(`${process.cwd()}/src/routes/+page.svelte`)
      expect(readAgainData).toMatchInlineSnapshot(`
        "<script lang=\\"ts\\">
          const strHref = 'www.google.com'
        </script>

        <h2>Home</h2>

        <div>Hello div</div>

        <a href=\\"www.google.com\\">Google</a>
        <a href={strHref}>Google</a>

        <img src=\\"test\\" alt=\\"test-1\\" />
        <p>
          <a href=\\"www.google.com\\">Google</a>
        </p>
        "
      `)
    }
  })
})
