import oxc from 'oxc-parser'
import { print as esrap_print, type PrintOptions } from 'esrap';

export type ParseOptions = oxc.ParserOptions & { filename: string }

export function parse(sourceText: string, options?: ParseOptions | null | undefined) {
	const result = oxc.parseSync(options?.filename ?? 'default.ts', sourceText, options)

	return result
}

export function print(node: {
	type: string;
	[key: string]: any;
}, opts?: PrintOptions): { code: string; map: any; } {
	return esrap_print(node, {
		...opts,
	})
}
