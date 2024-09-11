import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends('@theguild', 'eslint:recommended', 'prettier', 'plugin:svelte/recommended'),
  {
    plugins: {
      'unused-imports': unusedImports,
      svelte,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },

    rules: {
      'no-console': [
        'error',
        {
          allow: ['info', 'warn', 'error', 'time', 'timeEnd', 'dir'],
        },
      ],
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|error|e)$', // Ignore caught errors with names starting with _ or "error"
        },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'unused-imports/no-unused-imports': 'error',
      'no-implicit-coercion': 'off',
      //   '@typescript-eslint/ban-ts-ignore': 'off',
      //   '@typescript-eslint/ban-ts-comment': 'off',
      //   '@typescript-eslint/no-explicit-any': 'off',
      //   '@typescript-eslint/no-non-null-assertion': 'off',
      //   '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  //   {
  //     files: ['**/*.svelte'],

  //     languageOptions: {
  //       parser: parser,
  //       ecmaVersion: 5,
  //       sourceType: 'script',

  //       parserOptions: {
  //         parser: '@typescript-eslint/parser',
  //       },
  //     },
  //   },
]
