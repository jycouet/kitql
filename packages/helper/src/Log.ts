const config = {
  reset: {
    node: `\u001b[37m\u001b[0m`,
    browser: '',
  },
  green: {
    node: `\x1b[32m`,
    browser: 'color: green',
  },
  magneta: {
    node: `\x1b[35m`,
    browser: 'color: #ff00ff',
  },
  red: {
    node: `\u001B[31m`,
    browser: 'color: red',
  },
  cyan: {
    node: `\x1b[36m`,
    browser: 'color: cyan',
  },
  yellow: {
    node: `\x1b[33m`,
    browser: 'color: yellow',
  },
} as { [key: string]: { node: string; browser: string } }

export function logGreen(str: string) {
  return `${config.green.node}${str}${config.reset.node}`
}

export function logMagneta(str: string) {
  return `${config.magneta.node}${str}${config.reset.node}`
}

export function logRed(str: string) {
  return `${config.red.node}${str}${config.reset.node}`
}

export function logCyan(str: string) {
  return `${config.cyan.node}${str}${config.reset.node}`
}

export function logYellow(str: string) {
  return `${config.yellow.node}${str}${config.reset.node}`
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
      table.push(String(logMagneta(`[${this.toolName}]`)))
    }

    // DateTime or Time or nothing
    if (this.withDate === 'dateTime') {
      table.push(String(logMagneta(`[${new Date().toISOString()}]`)))
    } else if (this.withDate === 'time') {
      table.push(String(logMagneta(`[${new Date().toISOString().split('T')[1]}]`)))
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
        indexes.forEach(index => {
          posToReplace.push({ index, key })
        })

        // replace with %c in another str to make sure we don't change the order of indexes
        replacedStr = replacedStr.replaceAll(config[key].node, '%c')
      }
      const colors: string[] = []
      posToReplace
        .sort((a, b) => a.index - b.index)
        .forEach(c => {
          colors.push(config[c.key].browser)
        })

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
