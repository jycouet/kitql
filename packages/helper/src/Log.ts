import pino, { type Logger } from 'pino';

export function logGreen(str) {
	return `\x1b[32m${str}\x1b[37m\x1b[0m`;
}

export function logMagneta(str) {
	return `\x1b[35m${str}\x1b[37m\x1b[0m`;
}

export function logRed(str) {
	return `\u001B[31m${str}\x1b[37m\x1b[0m`;
}

export function logCyan(str) {
	return `\x1b[36m${str}\x1b[37m\x1b[0m`;
}

export class Log {
	private toolName: String;
	private logger: Logger;

	constructor(toolName: String) {
		this.toolName = toolName;

		this.logger = pino({
			transport: {
				target: 'pino-pretty',
				options: {
					colorize: true
				}
			}
		});
	}

	info(msg: string) {
		this.logger.info(`${logMagneta(`[${this.toolName}]`)} - ${msg}`);
	}

	error(msg: string) {
		this.logger.error(`${logMagneta(`[${this.toolName}]`)} - ${msg}`);
	}
}
