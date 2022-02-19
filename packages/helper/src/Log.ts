import pino from 'pino';
import PinoPretty from 'pino-pretty';

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

export type Options = {
	sync?: boolean | null;
	withTime?: boolean | null;
	withlevelKey?: boolean | null;
};
export class Log {
	private toolName: string;
	private logger: any;

	constructor(toolName: string, options: Options | null = null) {
		const { sync = false, withTime = false, withlevelKey = true } = options ?? {};
		this.toolName = toolName;
		this.logger = pino(
			PinoPretty({
				sync,
				translateTime: withTime ? true : false,
				ignore: `pid,hostname${withTime ? '' : ',time'}${withlevelKey ? '' : ',level'}`
			})
		);
	}

	info(msg: string) {
		this.logger.info(`${logMagneta(`[${this.toolName}]`)} - ${msg}`);
	}

	error(msg: string) {
		this.logger.error(`${logMagneta(`[${this.toolName}]`)} - ${msg}`);
	}
}
