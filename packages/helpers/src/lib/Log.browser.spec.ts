import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Log } from './Log.js'
import {
  black,
  blue,
  bold,
  cyan,
  gray,
  green,
  italic,
  magenta,
  red,
  strikethrough,
  white,
  yellow,
} from './colors/index.js'

describe('kitql - helper - Log', () => {
  beforeEach(() => {
    vi.mock('$lib/constants.js', () => ({
      BROWSER: true,
    }))
  })

  it('with all colors browser', () => {
    const log = new Log('tool name')

    const msg = `with all colors: 
    ${black('black')},   
    ${red('red')}, 
    ${green('green')}, 
    ${yellow('yellow')}
    ${blue('blue')}
    ${magenta('magenta')}, 
    ${cyan('cyan')} 
    ${white('white')} 
    ${gray('gray')} 
    ${bold('bold')} 
    ${italic('italic')} 
    ${strikethrough('strikethrough')} 
  `

    const result = log.info(msg)

    expect(result).toMatchInlineSnapshot(
      `
      [
        "%c[tool name]%c with all colors: 
          %cblack%c,   
          %cred%c, 
          %cgreen%c, 
          %cyellow%c
          %cblue%c
          %cmagenta%c, 
          %ccyan%c 
          %cwhite%c 
          %cgray%c 
          %cbold%c 
          %citalic%c 
          %cstrikethrough%c 
        ",
        "color: #ff00ff",
        "",
        "color: black",
        "",
        "color: red",
        "",
        "color: green",
        "",
        "color: yellow",
        "",
        "color: blue",
        "",
        "color: #ff00ff",
        "",
        "color: cyan",
        "",
        "color: white",
        "",
        "color: gray",
        "",
        "font-weight: bold",
        "",
        "font-style: italic",
        "",
        "text-decoration: line-through",
        "",
      ]
    `,
    )
  })

  it('with 2 red browser', () => {
    const log = new Log('tool name')

    const msg = `with red: ${red('red')} and another ${red('red2')}`

    const result = log.info(msg)

    expect(result).toMatchInlineSnapshot(`
      [
        "%c[tool name]%c with red: %cred%c and another %cred2%c",
        "color: #ff00ff",
        "",
        "color: red",
        "",
        "color: red",
        "",
      ]
    `)
  })

  it('are we in the browser?', () => {
    const log = new Log('tool name')

    const msg = `with red: ${red('red')} and another ${red('red2')}`
    // no need to put browser: true! it's detected with this.windows
    const result = log.info(msg)

    expect(result).toMatchInlineSnapshot(`
      [
        "%c[tool name]%c with red: %cred%c and another %cred2%c",
        "color: #ff00ff",
        "",
        "color: red",
        "",
        "color: red",
        "",
      ]
    `)
  })
})
