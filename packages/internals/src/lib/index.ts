export {
	getFilesUnder,
	read,
	write,
	relative,
	dirname,
	getRelativePackagePath,
	findFileOrUp,
} from './fs/fs.js'

export type { Statement, ParseResult } from './ast/ast.js'
export {
	parse,
	/** @deprecated Use `parse` instead */
	parseTs,
	visit,
	print,
	/** @deprecated */
	builders,
} from './ast/ast.js'

export { extractHtmlElementAttr_Text } from './ast/astHtml.js'
