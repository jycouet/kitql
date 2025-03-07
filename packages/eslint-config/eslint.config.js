import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import pnpmCatalogs from 'eslint-plugin-pnpm-catalogs'
import svelte from 'eslint-plugin-svelte'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import * as jsoncParser from 'jsonc-eslint-parser'
import ts from 'typescript-eslint'

import { findFileOrUp } from './helper/findFileOrUp.js'

const rulePrettierIgnore = ({ pnpmCatalogs = true }) => {
	const pathPrettierIgnore = findFileOrUp('.prettierignore', { absolute: true })
	const rowIgnore = pathPrettierIgnore ? includeIgnoreFile(pathPrettierIgnore).ignores : []
	const ignores = pnpmCatalogs ? rowIgnore.filter((c) => !c.includes('package.json')) : rowIgnore
	return {
		name: '@kitql:prettier:ignores',
		ignores,
	}
}

const rulePnpmCatalogs = () => {
	return {
		name: 'pnpm-catalogs:package.json',
		files: ['package.json'],
		languageOptions: {
			parser: jsoncParser,
		},
		plugins: {
			'pnpm-catalogs': pnpmCatalogs,
		},
		rules: {
			'pnpm-catalogs/enforce-catalog': 'error',
			'pnpm-catalogs/valid-catalog': 'error',
		},
	}
}

const othersRules = () => {
	return [
		{
			name: 'eslint/defaults/recommended',
			...js.configs.recommended, // TODO, would be nice to have a name by default?
		},
		...ts.configs.recommended,
		...svelte.configs['flat/recommended'],
		{
			name: '@kitql:languages',
			languageOptions: {
				globals: {
					...globals.browser,
					...globals.node,
				},
			},
		},
		{
			name: '@kitql:svelte:languages',
			files: ['**/*.svelte'],
			languageOptions: {
				parserOptions: {
					parser: ts.parser,
				},
			},
		},
		{
			name: '@kitql:ignores',
			ignores: ['build/', '.svelte-kit/', 'dist/', '**/build/', '**/.svelte-kit/', '**/dist/'],
		},
		{
			name: '@kitql:unused-imports',
			plugins: {
				'unused-imports': unusedImports,
			},
			rules: {
				'no-unused-vars': 'off',
				'@typescript-eslint/no-unused-vars': 'off',

				'unused-imports/no-unused-imports': 'error',
				'unused-imports/no-unused-vars': 'off',
				// 'unused-imports/no-unused-vars': [
				//   'warn',
				//   {
				//     vars: 'all',
				//     varsIgnorePattern: '^_',
				//     args: 'after-used',
				//     argsIgnorePattern: '^_',
				//   },
				// ],
				'no-empty': ['error', { allowEmptyCatch: true }],
			},
		},
		{
			name: '@kitql:rules',
			rules: {
				'no-console': [
					'error',
					{
						allow: ['info', 'warn', 'error', 'time', 'timeEnd', 'dir'],
					},
				],

				'@typescript-eslint/no-require-imports': 'off',
				'@typescript-eslint/ban-ts-ignore': 'off',
				'@typescript-eslint/ban-ts-comment': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-non-null-assertion': 'off',
				'@typescript-eslint/no-unused-expressions': 'off',
				'@typescript-eslint/no-empty-object-type': 'off',

				'no-undef': 'off',
				'no-inner-declarations': 'off',

				'svelte/no-at-html-tags': 'off',
				'svelte/no-inner-declarations': 'off',

				'svelte/require-each-key': 'warn',
			},
		},
	]
}

/** @type {import('eslint').Linter.Config[]} */
export const config = [
	//
	rulePrettierIgnore({ pnpmCatalogs: true }),
	rulePnpmCatalogs(),
	...othersRules(),
]

/** @deprecated import { kitql } from '@kitql/eslint-config' */
export default config

/**
 * @param {Object} options
 * @param {boolean} options.pnpmCatalogs
 * @returns {import('eslint').Linter.Config[]}
 */
export const kitql = (options) => {
	const pnpmCatalogs = options?.pnpmCatalogs ?? true

	return [
		//
		rulePrettierIgnore({ pnpmCatalogs }),
		pnpmCatalogs ? rulePnpmCatalogs() : [],
		...othersRules(),
	]
}
