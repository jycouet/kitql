const config = {
  reset: {
    node: `\x1b[0m`,
    browser: '',
  },

  // Base
  black: {
    node: `\x1b[30m`,
    browser: 'color: black',
  },
  red: {
    node: `\x1b[31m`,
    browser: 'color: red',
  },
  green: {
    node: `\x1b[32m`,
    browser: 'color: green',
  },
  yellow: {
    node: `\x1b[33m`,
    browser: 'color: yellow',
  },
  blue: {
    node: `\x1b[34m`,
    browser: 'color: blue',
  },
  magneta: {
    node: `\x1b[35m`,
    browser: 'color: #ff00ff',
  },
  cyan: {
    node: `\x1b[36m`,
    browser: 'color: cyan',
  },
  white: {
    node: `\x1b[37m`,
    browser: 'color: white',
  },
  gray: {
    node: `\x1b[90m`,
    browser: 'color: gray',
  },

  // Modif
  bold: {
    node: `\x1b[1m`,
    browser: 'font-weight: bold',
  },
  italic: {
    node: `\x1b[3m`,
    browser: 'font-style: italic',
  },
  strikethrough: {
    node: `\x1b[9m`,
    browser: 'text-decoration: line-through',
  },
} as { [key: string]: { node: string; browser: string } }

export function black(str: string) {
  return `${config.black.node}${str}${config.reset.node}`
}

export function red(str: string) {
  return `${config.red.node}${str}${config.reset.node}`
}

export function green(str: string) {
  return `${config.green.node}${str}${config.reset.node}`
}

export function yellow(str: string) {
  return `${config.yellow.node}${str}${config.reset.node}`
}

export function blue(str: string) {
  return `${config.blue.node}${str}${config.reset.node}`
}

export function magneta(str: string) {
  return `${config.magneta.node}${str}${config.reset.node}`
}

export function cyan(str: string) {
  return `${config.cyan.node}${str}${config.reset.node}`
}

export function white(str: string) {
  return `${config.white.node}${str}${config.reset.node}`
}

export function gray(str: string) {
  return `${config.gray.node}${str}${config.reset.node}`
}

export function bold(str: string) {
  return `${config.bold.node}${str}${config.reset.node}`
}

export function italic(str: string) {
  return `${config.italic.node}${str}${config.reset.node}`
}

export function strikethrough(str: string) {
  return `${config.strikethrough.node}${str}${config.reset.node}`
}

export class Log {
  private toolName: string
  private levelsToShow: null | number
  private withDate: null | 'dateTime' | 'time'
  private prefixEmoji: string

  get isBrowser() {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined'
  }

  constructor(
    toolName: string,
    options?: {
      levelsToShow?: null | number
      withDate?: 'dateTime' | 'time'
      prefixEmoji?: string
    },
  ) {
    this.toolName = toolName
    this.levelsToShow = options?.levelsToShow ?? 2
    this.withDate = options?.withDate ?? null
    this.prefixEmoji = options?.prefixEmoji ?? ''
  }

  public setLevel(logLevel: number) {
    this.levelsToShow = logLevel
  }

  private buildStr(
    msg: string,
    withError: boolean,
    withSuccess: boolean,
    indent: string,
    browser: boolean,
  ) {
    const table = []
    if (this.toolName) {
      table.push(String(magneta(`[${this.toolName}]`)))
    }

    // DateTime or Time or nothing
    if (this.withDate === 'dateTime') {
      table.push(String(magneta(`[${new Date().toISOString()}]`)))
    } else if (this.withDate === 'time') {
      table.push(String(magneta(`[${new Date().toISOString().split('T')[1]}]`)))
    }

    // Status icon or prefixEmoji
    if (withError) {
      table.push(`❌`)
    } else if (withSuccess) {
      table.push(`✅`)
    } else {
      table.push(String(this.prefixEmoji))
    }

    table.push(indent)

    // prefix message with a space if there is already something in the table
    if (table.join('').length > 0) {
      table.push(` `)
    }
    table.push(String(msg))

    const str = table.join('')

    if (browser) {
      let replacedStr = str
      // switch to browser console
      const posToReplace: { index: number; key: string }[] = []
      for (const key in config) {
        // check indexes
        const indexes = this.getAllIndexOf(str, config[key].node)
        for (const index of indexes) {
          posToReplace.push({ index, key })
        }

        // replace with %c in another str to make sure we don't change the order of indexes
        replacedStr = replacedStr.replaceAll(config[key].node, '%c')
      }
      const colors: string[] = []
      for (const c of posToReplace.sort((a, b) => a.index - b.index)) {
        colors.push(config[c.key].browser)
      }

      return [replacedStr, ...colors]
    }

    // wrap it because we always unwrap after ;)
    return [str]
  }

  private getAllIndexOf(str: string, subStr: string) {
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

  info(msg: string, conf?: { level?: number; withSuccess?: boolean; browser?: boolean }) {
    const level = conf?.level ?? 0
    const withSuccess = conf?.withSuccess ?? false
    const browser = conf?.browser ?? this.isBrowser

    if (this.levelsToShow !== null && level <= this.levelsToShow) {
      const indent = ' '.repeat(level)
      const built = this.buildStr(msg, false, withSuccess, indent, browser)
      console.info(...built)
      return built
    }
    return null
  }

  success(msg: string, conf?: { level?: number; browser?: boolean }) {
    const level = conf?.level ?? 0
    const browser = conf?.browser ?? this.isBrowser
    return this.info(msg, { level, withSuccess: true, browser })
  }

  error(msg: string, conf?: { browser?: boolean }) {
    const browser = conf?.browser ?? this.isBrowser
    const built = this.buildStr(msg, true, false, '', browser)
    console.error(...built)
    return built
  }
}
