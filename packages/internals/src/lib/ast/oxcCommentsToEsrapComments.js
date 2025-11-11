// @ts-check

/** @import { TSESTree } from '@typescript-eslint/types' */
/** @import { Comment as OxcComment } from 'oxc-parser' */

/** @param {string} code
 * @param {TSESTree.Program} oxc_ast
 * @param { OxcComment[]} oxc_comments
 *
 * @deprecated To be replaced by adding in oxc parse option `{ loc: true }`
 *             when https://github.com/oxc-project/oxc/issues/10307 is done
 */
export function oxcCommentsToEsrapComments(code, oxc_ast, oxc_comments) {
	oxc_comments = oxc_comments.map((comment) => {
		const startPos = getPositionFromOffset(code, comment.start)
		const endPos = getPositionFromOffset(code, comment.end)

		let value = comment.value
		// Normalize indentation for block comments with newlines (same as acorn)
		if (comment.type === 'Block' && /\n/.test(value)) {
			let a = comment.start
			while (a > 0 && code[a - 1] !== '\n') a -= 1

			let b = a
			while (/[ \t]/.test(code[b])) b += 1

			const indentation = code.slice(a, b)
			value = value.replace(new RegExp(`^${indentation}`, 'gm'), '')
		}

		return {
			type: comment.type,
			value,
			start: comment.start,
			end: comment.end,
			loc: {
				start: startPos,
				end: endPos,
			},
		}
	})

	// Add location information to AST nodes
	addLocationToNode(oxc_ast, code)

	return {
		ast: oxc_ast,
		comments: /** @type {TSESTree.Comment[]} */ (/** @type {any} */ (oxc_comments)),
	}
}

/**
 * Add location information to AST nodes using a more efficient approach
 * @param {any} node
 * @param {string} source
 * @param {Set<any>} visited
 */
function addLocationToNode(node, source, visited = new Set()) {
	if (!node || typeof node !== 'object' || visited.has(node)) {
		return
	}

	visited.add(node)

	// Add loc to current node if it has start/end
	if (node.start !== undefined && node.end !== undefined) {
		node.loc = {
			start: getPositionFromOffset(source, node.start),
			end: getPositionFromOffset(source, node.end),
		}
	}

	// Known non-AST properties to skip (much smaller and more maintainable)
	const skipProperties = new Set([
		'type',
		'start',
		'end',
		'loc',
		'range',
		'raw',
		'value',
		'name',
		'operator',
		'prefix',
		'postfix',
		'regex',
		'flags',
		'pattern',
		'computed',
		'optional',
		'shorthand',
		'method',
		'kind',
		'definite',
		'declare',
		'generator',
		'async',
		'directive',
	])

	// Process all properties, filtering out known non-AST properties
	for (const [key, value] of Object.entries(node)) {
		if (skipProperties.has(key)) continue

		if (value && typeof value === 'object') {
			if (Array.isArray(value)) {
				value.forEach((item) => addLocationToNode(item, source, visited))
			} else {
				addLocationToNode(value, source, visited)
			}
		}
	}
}

/**
 * Convert byte offset to line/column position
 * @param {string} source
 * @param {number} offset
 * @returns {{ line: number, column: number }}
 */
function getPositionFromOffset(source, offset) {
	let line = 1
	let column = 0

	for (let i = 0; i < offset && i < source.length; i++) {
		if (source[i] === '\n') {
			line++
			column = 0
		} else {
			column++
		}
	}

	return { line, column }
}
