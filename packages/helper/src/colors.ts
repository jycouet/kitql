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

const dataBrowser = {
  reset: '',
  bold: 'font-weight: bold',
  dim: 'opacity: 0.5',
  italic: 'font-style: italic',
  underline: 'text-decoration: underline',
  inverse: 'filter: invert(1)',
  hidden: 'visibility: hidden',
  strikethrough: 'text-decoration: line-through',
  black: 'color: black',
  red: 'color: red',
  green: 'color: green',
  yellow: 'color: yellow',
  blue: 'color: blue',
  magenta: 'color: #ff00ff',
  cyan: 'color: cyan',
  white: 'color: white',
  gray: 'color: gray',
  bgBlack: 'background-color: black',
  bgRed: 'background-color: red',
  bgGreen: 'background-color: green',
  bgYellow: 'background-color: yellow',
  bgBlue: 'background-color: blue',
  bgMagenta: 'background-color: #ff00ff',
  bgCyan: 'background-color: cyan',
  bgWhite: 'background-color: white',
  blackBright: 'color: #a9a9a9',
  redBright: 'color: #ff4500',
  greenBright: 'color: #7fff00',
  yellowBright: 'color: #ffd700',
  blueBright: 'color: #1e90ff',
  magentaBright: 'color: #ff69b4',
  cyanBright: 'color: #00ffff',
  whiteBright: 'color: #ffffff',
  bgBlackBright: 'background-color: #a9a9a9',
  bgRedBright: 'background-color: #ff4500',
  bgGreenBright: 'background-color: #7fff00',
  bgYellowBright: 'background-color: #ffd700',
  bgBlueBright: 'background-color: #1e90ff',
  bgMagentaBright: 'background-color: #ff69b4',
  bgCyanBright: 'background-color: #00ffff',
  bgWhiteBright: 'background-color: #ffffff',
}

// import * as styles from './styles'
// export const getStyle = (styleKey: string) => {
//   // @ts-ignore
//   return styles[styleKey] ?? undefined
// }

type Style = keyof typeof dataNode
export const color = (style: Style, str: string, isBrowser = false) => {
  return isBrowser ? colorBrowserPrepare(style, str) : colorNode(style, str)
}

export const colorNode = (style: Style, str: string) => {
  return `${dataNode[style].start}${str}${dataNode[style].end}`
}

const START = `$$KitQL_`
const END = `$$KitQLEND$$`

export const colorBrowserPrepare = (style: Style, str: string) => {
  return `${START}${style}${START}${str}${END}`
}

export const colorBrowserProcess = (str: string) => {
  const originalStr = str
  const posToReplace: { index: number; browser: string }[] = []

  for (const key in dataBrowser) {
    // check indexes
    const indexesStarts = getAllIndexOf(originalStr, `${START}${key}${START}`)
    for (const index of indexesStarts) {
      posToReplace.push({ index, browser: dataBrowser[key as Style] })
    }

    // replace with %c in another str to make sure we don't change the order of indexes
    str = str.replaceAll(`${START}${key}${START}`, '%c')
  }

  const indexesEnd = getAllIndexOf(originalStr, END)
  for (const index of indexesEnd) {
    posToReplace.push({ index, browser: dataBrowser.reset })
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
