import { describe, expect, it } from 'vitest'

import { getFilesUnder, read, write } from './fs.js'

describe('fs', () => {
  it('read a file', async () => {
    const data = read(`${process.cwd()}/src/routes/+page.svelte`)
    expect(data).toMatchInlineSnapshot(`
      "<script lang=\\"ts\\">
      </script>

      <h2>Home</h2>
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
      write(`${process.cwd()}/node_modules/routes/+page.svelte`, [data])
      const readAgainData = read(`${process.cwd()}/node_modules/routes/+page.svelte`)
      expect(readAgainData).toMatchInlineSnapshot(`
        "<script lang=\\"ts\\">
        </script>

        <h2>Home</h2>
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
        </script>

        <h2>Home</h2>
        "
      `)
    }
  })

  it('getFilesUnder', async () => {
    const location = `${process.cwd()}/src/routes/`
    expect(getFilesUnder(location)).toMatchInlineSnapshot(`
      [
        "+layout.svelte",
        "+page.svelte",
      ]
    `)
  })
})
