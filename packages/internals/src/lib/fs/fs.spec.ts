import { describe, expect, it } from 'vitest'

import { findFileOrUp, getFilesUnder, getRelativePackagePath, read, relative, write } from './fs.js'

describe('getRelativePackagePath', () => {
	it('should get package path single', async () => {
		const path = getRelativePackagePath('recast')
		expect(path).toMatchInlineSnapshot(`"node_modules/recast"`)
	})

	it('should get package path with / and in root', async () => {
		const path = getRelativePackagePath('@theguild/prettier-config')
		expect(path).toMatchInlineSnapshot(`"../../node_modules/@theguild/prettier-config"`)
	})

	it('should get null as the package doesn t exist', async () => {
		const path = getRelativePackagePath('This_Package_doesnt_exist')
		expect(path).toBeNull()
	})
})

describe('getFilesUnder', () => {
	it('should get files under a directory', async () => {
		const location = relative(`${process.cwd()}`, 'src/routes/')
		expect(getFilesUnder(location)).toMatchInlineSnapshot(`
      [
        "+layout.svelte",
        "+page.svelte",
      ]
    `)
	})

	it('should get files under a directory', async () => {
		const location = relative(`${process.cwd()}`, 'src/coucou/')
		expect(getFilesUnder(location).length).toBe(0)
	})
})

describe('read', () => {
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
})

describe('write', () => {
	it('write file in a new place', async () => {
		const data = read(`${process.cwd()}/src/routes/+page.svelte`)
		if (data) {
			const path =
				`${process.cwd()}/node_modules/routes/+page.svelte` + new Date().toISOString().replace(':', '_')
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

describe('findFileOrUp', () => {
	it('should find a file', async () => {
		const res = findFileOrUp('package.json')
		expect(res).toMatchInlineSnapshot(`"package.json"`)
	})

	it('should find a file absolute', async () => {
		const res = findFileOrUp('package.json', { absolute: true })
		expect(res).not.toBe('package.json')
		expect(res).match(/package.json$/)
	})
})
