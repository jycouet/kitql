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
  private logLevel: null | 0 | 1 | 2

  constructor(toolName: string, logLevel: null | 0 | 1 | 2 = null) {
    this.toolName = toolName
    this.logLevel = logLevel
  }

  info(msg: string, conf: { level?: 0 | 1 | 2; withSuccess?: boolean } = { level: 0, withSuccess: false }) {
    const level = conf.level ?? 0
    const withSuccess = conf.withSuccess ?? false
    if (this.logLevel && level <= this.logLevel) {
      const indent = ' '.repeat(level)
      console.info(`${logMagneta(`[${this.toolName}]`)}${withSuccess ? '✅' : ''}${indent} ${msg}`)
    }
  }

  success(msg: string, conf: { level?: 0 | 1 | 2 } = { level: 0 }) {
    this.info(msg, { level: conf.level, withSuccess: true })
  }

  error(msg: string) {
    console.error(`${logMagneta(`[${this.toolName}]`)}❌ ${msg}`)
  }
}
