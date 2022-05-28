export function logGreen(str: string) {
  return `\x1b[32m${str}\x1b[37m\x1b[0m`
}

export function logMagneta(str: string) {
  return `\x1b[35m${str}\x1b[37m\x1b[0m`
}

export function logRed(str: string) {
  return `\u001B[31m${str}\x1b[37m\x1b[0m`
}

export function logCyan(str: string) {
  return `\x1b[36m${str}\x1b[37m\x1b[0m`
}

export function logYellow(str: string) {
  return `\x1b[33m${str}\x1b[37m\x1b[0m`
}

export class Log {
  private toolName: string
  private levelsToShow: null | number
  private withDate: null | 'dateTime' | 'time'
  private prefixEmoji: string

  constructor(
    toolName: string,
    options: { levelsToShow?: null | number; withDate?: 'dateTime' | 'time'; prefixEmoji?: string } = {}
  ) {
    this.toolName = toolName
    this.levelsToShow = options.levelsToShow ?? 2
    this.withDate = options.withDate ?? null
    this.prefixEmoji = options.prefixEmoji ?? ''
  }

  public setLevel(logLevel?: null | number) {
    this.levelsToShow = logLevel
  }

  private buildStr(msg: string, withError: boolean, withSuccess: boolean, indent: string) {
    const table = []
    table.push(`${logMagneta(`[${this.toolName}]`)}`)

    // DateTime or Time or nothing
    if (this.withDate === 'dateTime') {
      table.push(`${logMagneta(`[${new Date().toISOString()}]`)}`)
    } else if (this.withDate === 'time') {
      table.push(`${logMagneta(`[${new Date().toISOString().split('T')[1]}]`)}`)
    }

    // Status icon or prefixEmoji
    if (withError) {
      table.push(`❌`)
    } else if (withSuccess) {
      table.push(`✅`)
    } else {
      table.push(`${this.prefixEmoji}`)
    }

    table.push(indent)
    table.push(` ${msg}`)

    return table.join('')
  }

  info(msg: string, conf: { level?: number; withSuccess?: boolean } = { level: 0, withSuccess: false }) {
    const level = conf.level ?? 0
    const withSuccess = conf.withSuccess ?? false
    if (this.levelsToShow !== null && level <= this.levelsToShow) {
      const indent = ' '.repeat(level)
      console.info(this.buildStr(msg, false, withSuccess, indent))
    }
  }

  success(msg: string, conf: { level?: number } = { level: 0 }) {
    this.info(msg, { level: conf.level, withSuccess: true })
  }

  error(msg: string) {
    console.error(this.buildStr(msg, true, false, ''))
  }
}
