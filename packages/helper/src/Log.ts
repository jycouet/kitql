export function logGreen(str: string) {
  return `\x1b[32m${str}\x1b[37m\x1b[0m`;
}

export function logMagneta(str: string) {
  return `\x1b[35m${str}\x1b[37m\x1b[0m`;
}

export function logRed(str: string) {
  return `\u001B[31m${str}\x1b[37m\x1b[0m`;
}

export function logCyan(str: string) {
  return `\x1b[36m${str}\x1b[37m\x1b[0m`;
}

export function logYellow(str: string) {
  return `\x1b[33m${str}\x1b[37m\x1b[0m`;
}

export class Log {
  private toolName: string;

  constructor(toolName: string) {
    this.toolName = toolName;
  }

  info(msg: string) {
    console.info(`${logMagneta(`[${this.toolName}]`)} ${msg}`);
  }

  error(msg: string) {
    console.error(`${logMagneta(`[${this.toolName}]`)}${logRed(`[E]`)} ${msg}`);
  }
}
