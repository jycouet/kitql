import kitql from '@kitql/eslint-config'

/** @type { import("eslint").Linter.FlatConfig } */
export default [
  ...kitql,
  {
    rules: {
      '@typescript-eslint/no-unsafe-function-type': off,
    },
  },
]
