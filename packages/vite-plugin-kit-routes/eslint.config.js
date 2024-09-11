import kitql from '@kitql/eslint-config'

/** @type { import("eslint").Linter.Config } */
export default [
  {
    rules: {
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-unused-disable': 'off',
    },
  },
  ...kitql,
]
