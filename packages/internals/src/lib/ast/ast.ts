import { print as esrap_print, type PrintOptions } from 'esrap'
import oxc from 'oxc-parser'
import { generate } from 'astring'
import prettier from 'prettier'
import { prettyPrint } from "recast"
export type ParseOptions = oxc.ParserOptions & { filename: string }

export function parse(sourceText: string, options?: ParseOptions | null | undefined) {
	const result = oxc.parseSync(options?.filename ?? 'default.ts', sourceText, options)

	return result
}

export function print(
	node: {
		type: string
		[key: string]: any
	},
	opts?: PrintOptions,
) {
	return prettyPrint(node)
	// return generate(node)
	// return esrap_print(node, {
	// 	...opts,
	// })
}
