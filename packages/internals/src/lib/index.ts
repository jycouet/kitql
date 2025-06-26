export {
	getFilesUnder,
	read,
	write,
	relative,
	dirname,
	getRelativePackagePath,
	findFileOrUp,
} from './fs/fs.js'

export type { ParseResult } from './ast/ast.js'
export { parse, print, walk } from './ast/ast.js'

export { extractHtmlElementAttr_Text } from './ast/astHtml.js'
