module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    // '@theguild',
    // '@theguild/eslint-config/mdx',
    '@theguild/eslint-config/json',
    '@theguild/eslint-config/yml',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:svelte/recommended',
  ],
  plugins: ['unused-imports', 'svelte', '@typescript-eslint'],
  rules: {
    'no-console': ['error', { allow: ['info', 'warn', 'error', 'time', 'timeEnd', 'dir'] }],
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'no-empty': ['error', { allowEmptyCatch: true }],
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/ban-types': 'error',
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    {
      files: ['*.graphql', '*.gql'],
      parserOptions: {
        operations: '**/*.gql',
        schema: '**/*.graphql',
      },
      extends: ['plugin:@graphql-eslint/schema-all', 'plugin:@graphql-eslint/operations-all'],
      rules: {
        '@graphql-eslint/alphabetize': 'off',
        '@graphql-eslint/no-one-place-fragments': 'off',
      },
    },
  ],
  ignorePatterns: ['*.md'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
}
