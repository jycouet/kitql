import { describe, expect, it } from 'vitest'

import { getFilesUnder, read, write } from './fs.js'

describe('fs', () => {
  it('getFilesUnder', async () => {
    const location = `${process.cwd()}/src/routes/`
    expect(getFilesUnder(location)).toMatchInlineSnapshot(`
      [
        "+layout.svelte",
        "+page.svelte",
      ]
    `)
  })

  it('read', async () => {
    const location = `${process.cwd()}/src/routes/+page.svelte`
    const data1 = read(location) ?? ''
    // expect(read(data1)).toMatchInlineSnapshot('null')
  })
})
