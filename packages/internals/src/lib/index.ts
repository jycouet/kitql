export {
	getFilesUnder,
	read,
	write,
	relative,
	dirname,
	getRelativePackagePath,
	findFileOrUp,
} from './fs/fs.js'

export { parse, print } from './ast/ast.js'
export type { ParseOptions } from './ast/ast.js'
export type { Statement, ParseResult } from 'oxc-parser'
export { walk } from 'oxc-walker'

export { extractHtmlElementAttr_Text } from './ast/astHtml.js'