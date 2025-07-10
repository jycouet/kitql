import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import pluginPnpm from 'eslint-plugin-pnpm'
import svelte from 'eslint-plugin-svelte'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import * as jsoncParser from 'jsonc-eslint-parser'
import ts from 'typescript-eslint'
import * as yamlParser from 'yaml-eslint-parser'
import prettier from 'eslint-config-prettier';

import { findFileOrUp } from './helper/findFileOrUp.js'

/**
 * @typedef {Object} PnpmCatalogsConfig
 * @property {boolean} [enable=true] - Whether to enable pnpm catalogs rules
 * @property {string[]} [json_files] - Files to apply the rules to
 * @property {Record<string, any>} [json_rules] - Rules configuration
 * @property {string[]} [yaml_files] - Files to apply the rules to
 * @property {Record<string, any>} [yaml_rules] - Rules configuration
 */

const rulePrettierIgnore = ({ pnpmCatalogsEnabled = true }) => {
	const pathPrettierIgnore = findFileOrUp('.prettierignore', { absolute: true })
	const rowIgnore = pathPrettierIgnore ? (includeIgnoreFile(pathPrettierIgnore).ignores ?? []) : []
	const ignores = pnpmCatalogsEnabled
		? rowIgnore.filter((c) => !c.includes('package.json'))
		: rowIgnore
	return {
		name: '@kitql:prettier:ignores',
		ignores,
	}
}

/**
 * @param {PnpmCatalogsConfig} options
 */
const rulePnpmCatalogs = (options = {}) => {
	const {
		enable = true,
		json_files = ['package.json', '**/package.json'],
		json_rules = {
			'pnpm/json-enforce-catalog': 'error',
			'pnpm/json-valid-catalog': 'error',
			'pnpm/json-prefer-workspace-settings': 'error',
			...options.json_rules,
		},
		yaml_files = ['pnpm-workspace.yaml'],
		yaml_rules = {
			'pnpm/yaml-no-unused-catalog-item': 'error',
			'pnpm/yaml-no-duplicate-catalog-item': 'off',
			...options.yaml_rules,
		},
	} = options

	if (!enable) return []

	return [
		{
			name: 'pnpm/package.json',
			files: json_files,
			languageOptions: {
				parser: jsoncParser,
			},
			plugins: {
				pnpm: pluginPnpm,
			},
			rules: json_rules,
		},
		{
			name: 'pnpm/pnpm-workspace-yaml',
			files: yaml_files,
			languageOptions: {
				parser: yamlParser,
			},
			plugins: {
				pnpm: pluginPnpm,
			},
			rules: yaml_rules,
		},
	]
}

const othersRules = () => {
	return [
		{
			name: 'eslint/defaults/recommended',
			...js.configs.recommended, // TODO, would be nice to have a name by default?
		},
		...ts.configs.recommended,
		...svelte.configs.recommended,
		prettier,
		...svelte.configs.prettier,
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
			files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
			languageOptions: {
				parserOptions: {
					projectService: true,
					extraFileExtensions: ['.svelte'],
					parser: ts.parser,
				}
			}
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
const config = [
	//
	rulePrettierIgnore({ pnpmCatalogsEnabled: true }),
	...othersRules(),
	...rulePnpmCatalogs(),
]

export default config

/**
 * @typedef {Object} KitqlOptions
 * @property {PnpmCatalogsConfig} [pnpmCatalogs] - Configuration object for pnpm catalogs
 */

/**
 * @param {KitqlOptions} [options]
 * @returns {import('eslint').Linter.Config[]}
 */
export const kitql = (options = {}) => {
	const pnpmCatalogsConfig = options?.pnpmCatalogs ?? { enable: false }
	const pnpmCatalogsEnabled = pnpmCatalogsConfig.enable !== false

	return [
		//
		rulePrettierIgnore({ pnpmCatalogsEnabled }),
		...othersRules(),
		...(pnpmCatalogsEnabled ? rulePnpmCatalogs(pnpmCatalogsConfig) : []),
	]
}
