import kitql from '@kitql/eslint-config'

/** @type { import("eslint").Linter.Config } */
export default [
  ...kitql,
  {
    rules: {
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-unused-disable': 'off',
    },
  },
]
