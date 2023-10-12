import * as styles from './styles'

const dataNode = {
  reset: { start: '\x1b[0m', end: '\x1b[0m' },
  bold: { start: '\x1b[1m', end: '\x1b[22m' },
  dim: { start: '\x1b[2m', end: '\x1b[22m' },
  italic: { start: '\x1b[3m', end: '\x1b[23m' },
  underline: { start: '\x1b[4m', end: '\x1b[24m' },
  inverse: { start: '\x1b[7m', end: '\x1b[27m' },
  hidden: { start: '\x1b[8m', end: '\x1b[28m' },
  strikethrough: { start: '\x1b[9m', end: '\x1b[29m' },
  black: { start: '\x1b[30m', end: '\x1b[39m' },
  red: { start: '\x1b[31m', end: '\x1b[39m' },
  green: { start: '\x1b[32m', end: '\x1b[39m' },
  yellow: { start: '\x1b[33m', end: '\x1b[39m' },
  blue: { start: '\x1b[34m', end: '\x1b[39m' },
  magenta: { start: '\x1b[35m', end: '\x1b[39m' },
  cyan: { start: '\x1b[36m', end: '\x1b[39m' },
  white: { start: '\x1b[37m', end: '\x1b[39m' },
  gray: { start: '\x1b[90m', end: '\x1b[39m' },
  bgBlack: { start: '\x1b[40m', end: '\x1b[49m' },
  bgRed: { start: '\x1b[41m', end: '\x1b[49m' },
  bgGreen: { start: '\x1b[42m', end: '\x1b[49m' },
  bgYellow: { start: '\x1b[43m', end: '\x1b[49m' },
  bgBlue: { start: '\x1b[44m', end: '\x1b[49m' },
  bgMagenta: { start: '\x1b[45m', end: '\x1b[49m' },
  bgCyan: { start: '\x1b[46m', end: '\x1b[49m' },
  bgWhite: { start: '\x1b[47m', end: '\x1b[49m' },
  blackBright: { start: '\x1b[90m', end: '\x1b[39m' },
  redBright: { start: '\x1b[91m', end: '\x1b[39m' },
  greenBright: { start: '\x1b[92m', end: '\x1b[39m' },
  yellowBright: { start: '\x1b[93m', end: '\x1b[39m' },
  blueBright: { start: '\x1b[94m', end: '\x1b[39m' },
  magentaBright: { start: '\x1b[95m', end: '\x1b[39m' },
  cyanBright: { start: '\x1b[96m', end: '\x1b[39m' },
  whiteBright: { start: '\x1b[97m', end: '\x1b[39m' },
  bgBlackBright: { start: '\x1b[100m', end: '\x1b[49m' },
  bgRedBright: { start: '\x1b[101m', end: '\x1b[49m' },
  bgGreenBright: { start: '\x1b[102m', end: '\x1b[49m' },
  bgYellowBright: { start: '\x1b[103m', end: '\x1b[49m' },
  bgBlueBright: { start: '\x1b[104m', end: '\x1b[49m' },
  bgMagentaBright: { start: '\x1b[105m', end: '\x1b[49m' },
  bgCyanBright: { start: '\x1b[106m', end: '\x1b[49m' },
  bgWhiteBright: { start: '\x1b[107m', end: '\x1b[49m' },
}

export const getStyle = (styleKey: string) => {
  // @ts-ignore
  return styles[styleKey] ?? undefined
}

type Style = keyof typeof dataNode
export const color = (style: Style, str: string, isBrowser = false) => {
  return isBrowser ? colorBrowserPrepare(style, str) : colorNode(style, str)
}

export const colorNode = (style: Style, str: string) => {
  return `${dataNode[style].start}${str}${dataNode[style].end}`
}

const START1 = `$$KitQL_`
const START2 = `_KitQL$$`
const END = `$$KitQLEND$$`
export const colorBrowserPrepare = (style: Style, str: string) => {
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

export const colorBrowserProcess = (str: string) => {
  const originalStr = str
  const posToReplace: { index: number; browser: string }[] = []

  const tagsUsed = extractKitQLTags(originalStr)
  for (const key of tagsUsed) {
    // check indexes
    const indexesStarts = getAllIndexOf(originalStr, `${START1}${key}${START2}`)
    for (const index of indexesStarts) {
      posToReplace.push({ index, browser: getStyle(key) })
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
