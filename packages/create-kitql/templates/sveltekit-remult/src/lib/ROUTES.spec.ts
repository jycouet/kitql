import { describe, expect, it } from 'vitest'

import { route } from './ROUTES'

describe('ROUTES', () => {
  it('root path is /', () => {
    expect(route('/')).toBe('/')
  })
})
