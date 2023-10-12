import { colorBrowserProcess, magenta } from './colors'

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
      table.push(String(magenta(`[${this.toolName}]`)))
    }

    // DateTime or Time or nothing
    if (this.withDate === 'dateTime') {
      table.push(String(magenta(`[${new Date().toISOString()}]`)))
    } else if (this.withDate === 'time') {
      table.push(String(magenta(`[${new Date().toISOString().split('T')[1]}]`)))
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
      return colorBrowserProcess(str)
    }

    // wrap it because we always unwrap after ;)
    return [str]
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
