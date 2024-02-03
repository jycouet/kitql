import {
  bgBlueBright,
  bgGreen,
  bgRedBright,
  bold,
  colorProcess,
  greenBright,
  redBright,
} from './colors/index.js'

export class Log {
  private toolName: string
  private levelsToShow: null | number
  private withDate: null | 'dateTime' | 'time'
  private prefixEmoji: string

  constructor(
    toolName: string,
    options?: {
      levelsToShow?: null | number
      withDate?: 'dateTime' | 'time'
      prefixEmoji?: string
    },
  ) {
    this.toolName = toolName
    this.levelsToShow = options?.levelsToShow ?? 3
    this.withDate = options?.withDate ?? null
    this.prefixEmoji = options?.prefixEmoji ?? ''
  }

  private buildStr(withError: boolean, withSuccess: boolean, level: number, ...msgs: any[]) {
    const table = []
    if (this.toolName) {
      const strTool = ` ${this.toolName} `
      if (withError) {
        table.push(bgRedBright(strTool))
      } else if (withSuccess) {
        table.push(bgGreen(strTool))
      } else {
        table.push(bgBlueBright(strTool))
      }
    }

    // DateTime or Time or nothing
    if (this.withDate === 'dateTime') {
      table.push(String(bgBlueBright(`${new Date().toISOString()} `)))
    } else if (this.withDate === 'time') {
      table.push(String(bgBlueBright(`${new Date().toISOString().split('T')[1]} `)))
    }

    // Status icon or prefixEmoji
    if (withError) {
      table.push(bold(redBright(' ✘')))
    } else if (withSuccess) {
      table.push(bold(greenBright(' ✔')))
    } else {
      table.push(String('' + this.prefixEmoji))
    }

    if (level > 0) {
      const indent = ' '.repeat(level)
      table.push(indent)
    }

    if (table.length === 0 || (table.length === 1 && table[0] === '')) {
      return colorProcess(...[...msgs.flatMap((c) => c)])
    }

    return colorProcess(...[table.join(''), ...msgs.flatMap((c) => c)])
  }

  /**
   * console.info with options
   * @param conf with level of indentation
   */
  infoO(conf: { level: number }, ...msgs: any[]) {
    const built = this.buildStr(false, false, conf.level, ...msgs)
    console.info(...built.flatMap((c) => c))
    return built
  }

  /**
   * console.info
   */
  info(...msgs: any[]) {
    const built = this.buildStr(false, false, 0, ...msgs)
    console.info(...built.flatMap((c) => c))
    return built
  }

  /**
   * console.info with options and success icon
   * @param conf with level of indentation
   */
  successO(conf: { level: number }, ...msgs: any[]) {
    const built = this.buildStr(false, true, conf.level, msgs)
    console.info(...built.flatMap((c) => c))
    return built
  }

  /**
   * console.info with success icon
   */
  success(...msgs: any[]) {
    const built = this.buildStr(false, true, 0, msgs)
    console.info(...built.flatMap((c) => c))
    return built
  }

  /**
   * console.error with error icon
   */
  error(...msgs: any[]) {
    const built = this.buildStr(true, false, 0, msgs)
    // Keep error to have the stacktrace in the browser
    console.error(...built.flatMap((c) => c))
    return built
  }
}
