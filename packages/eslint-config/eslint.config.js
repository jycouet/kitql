import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import ts from 'typescript-eslint'

import { findFileOrUp } from './helper/findFileOrUp.js'

const pathPrettierIgnore = findFileOrUp('.prettierignore', { absolute: true })

/** @type {import('eslint').Linter.Config[]} */
export const config = [
  {
    name: '@kitql:prettier:ignores',
    ignores: includeIgnoreFile(pathPrettierIgnore).ignores,
  },
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
    },
  },
]

export default config
