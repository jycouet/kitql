const { plugins, ...prettierConfig } = require('@theguild/prettier-config')

module.exports = {
  ...prettierConfig,
  semi: false,
  plugins: [...plugins],
}
