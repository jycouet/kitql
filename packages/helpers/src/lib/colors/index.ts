import { BROWSER } from '$lib/constants.js'
import * as stylesBrowser from './stylesBrowser.js'
import * as stylesNode from './stylesNode.js'
import type { Style } from './types.js'

const getStyleBrowser = (styleKey: string) => {
  // @ts-ignore
  return stylesBrowser[styleKey] ?? undefined
}

const getStyleNode = (styleKey: string) => {
  // @ts-ignore
  return stylesNode[styleKey] ?? undefined
}

export const color = (style: Style, str: string) => {
  return BROWSER ? colorBrowser(style, str) : colorNode(style, str)
}

const colorNode = (style: Style, str: string) => {
  return `${getStyleNode(style).start}${str}${getStyleNode(style).end}`
}

const START1 = `$$KitQL_`
const START2 = `_KitQL$$`
const END = `$$KitQLEND$$`
const colorBrowser = (style: Style, str: string) => {
  return `${START1}${style}${START2}${str}${END}`
}

function extractKitQLTags(str: string) {
  const regex = /\$\$KitQL_(.*?)_KitQL\$\$/g
  let match
  const results = []

  while ((match = regex.exec(str)) !== null) {
    results.push(match[1])
  }

  return results
}

const getAllIndexOf = (str: string, subStr: string) => {
  let lastIndex = 0
  const indexes = []
  while (lastIndex !== -1) {
    lastIndex = str.indexOf(subStr, lastIndex)
    if (lastIndex !== -1) {
      indexes.push(lastIndex)
      lastIndex += subStr.length
    }
  }
  return indexes
}

export const colorProcess = (str: string): string[] => {
  if (!BROWSER) {
    return [str]
  }
  const originalStr = str
  const posToReplace: { index: number; browser: string }[] = []

  // we need to make it unique
  const tagsUsed = [...new Set(extractKitQLTags(str))]
  for (const key of tagsUsed) {
    // check indexes
    const indexesStarts = getAllIndexOf(originalStr, `${START1}${key}${START2}`)
    for (const index of indexesStarts) {
      posToReplace.push({ index, browser: getStyleBrowser(key) })
    }

    // replace with %c in another str to make sure we don't change the order of indexes
    str = str.replaceAll(`${START1}${key}${START2}`, '%c')
  }

  const indexesEnd = getAllIndexOf(originalStr, END)
  for (const index of indexesEnd) {
    posToReplace.push({ index, browser: '' })
  }
  str = str.replaceAll(END, '%c')

  const colors: string[] = []
  for (const c of posToReplace.sort((a, b) => a.index - b.index)) {
    colors.push(c.browser)
  }

  return [str, ...colors]
}

//

export const reset = (str: string) => {
  return color('reset', str)
}
export const bold = (str: string) => {
  return color('bold', str)
}
export const dim = (str: string) => {
  return color('dim', str)
}
export const italic = (str: string) => {
  return color('italic', str)
}
export const underline = (str: string) => {
  return color('underline', str)
}
export const inverse = (str: string) => {
  return color('inverse', str)
}
export const hidden = (str: string) => {
  return color('hidden', str)
}
export const strikethrough = (str: string) => {
  return color('strikethrough', str)
}
export const black = (str: string) => {
  return color('black', str)
}
export const red = (str: string) => {
  return color('red', str)
}
export const green = (str: string) => {
  return color('green', str)
}
export const yellow = (str: string) => {
  return color('yellow', str)
}
export const blue = (str: string) => {
  return color('blue', str)
}
export const magenta = (str: string) => {
  return color('magenta', str)
}
export const cyan = (str: string) => {
  return color('cyan', str)
}
export const white = (str: string) => {
  return color('white', str)
}
export const gray = (str: string) => {
  return color('gray', str)
}
export const bgBlack = (str: string) => {
  return color('bgBlack', str)
}
export const bgRed = (str: string) => {
  return color('bgRed', str)
}
export const bgGreen = (str: string) => {
  return color('bgGreen', str)
}
export const bgYellow = (str: string) => {
  return color('bgYellow', str)
}
export const bgBlue = (str: string) => {
  return color('bgBlue', str)
}
export const bgMagenta = (str: string) => {
  return color('bgMagenta', str)
}
export const bgCyan = (str: string) => {
  return color('bgCyan', str)
}
export const bgWhite = (str: string) => {
  return color('bgWhite', str)
}
export const blackBright = (str: string) => {
  return color('blackBright', str)
}
export const redBright = (str: string) => {
  return color('redBright', str)
}
export const greenBright = (str: string) => {
  return color('greenBright', str)
}
export const yellowBright = (str: string) => {
  return color('yellowBright', str)
}
export const blueBright = (str: string) => {
  return color('blueBright', str)
}
export const magentaBright = (str: string) => {
  return color('magentaBright', str)
}
export const cyanBright = (str: string) => {
  return color('cyanBright', str)
}
export const whiteBright = (str: string) => {
  return color('whiteBright', str)
}
export const bgBlackBright = (str: string) => {
  return color('bgBlackBright', str)
}
export const bgRedBright = (str: string) => {
  return color('bgRedBright', str)
}
export const bgGreenBright = (str: string) => {
  return color('bgGreenBright', str)
}
export const bgYellowBright = (str: string) => {
  return color('bgYellowBright', str)
}
export const bgBlueBright = (str: string) => {
  return color('bgBlueBright', str)
}
export const bgMagentaBright = (str: string) => {
  return color('bgMagentaBright', str)
}
export const bgCyanBright = (str: string) => {
  return color('bgCyanBright', str)
}
export const bgWhiteBright = (str: string) => {
  return color('bgWhiteBright', str)
}
