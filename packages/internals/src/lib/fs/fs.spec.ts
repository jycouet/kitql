import { describe, expect, it } from 'vitest'

import { getFilesUnder, read, relative, write } from './fs.js'

describe('fs', () => {
  it('getFilesUnder', async () => {
    const location = relative(`${process.cwd()}`, 'src/routes/')
    expect(getFilesUnder(location)).toMatchInlineSnapshot(`
      [
        "+layout.svelte",
        "+page.svelte",
      ]
    `)
  })

  it('read a file', async () => {
    const data = read(`${process.cwd()}/src/routes/+page.svelte`)
    expect(data).toMatchInlineSnapshot(`
      "<script lang="ts">
        const strHref = 'www.google.com'
      </script>

      <h2>Home</h2>

      <div>Hello div</div>

      <a href="www.google.com">Google</a>
      <a href={strHref}>Google</a>

      <img src="test" alt="test-1" />
      <p>
        <a href="www.google.com">Google</a>
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
        "<script lang="ts">
          const strHref = 'www.google.com'
        </script>

        <h2>Home</h2>

        <div>Hello div</div>

        <a href="www.google.com">Google</a>
        <a href={strHref}>Google</a>

        <img src="test" alt="test-1" />
        <p>
          <a href="www.google.com">Google</a>
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
        "<script lang="ts">
          const strHref = 'www.google.com'
        </script>

        <h2>Home</h2>

        <div>Hello div</div>

        <a href="www.google.com">Google</a>
        <a href={strHref}>Google</a>

        <img src="test" alt="test-1" />
        <p>
          <a href="www.google.com">Google</a>
        </p>
        "
      `)
    }
  })
})
