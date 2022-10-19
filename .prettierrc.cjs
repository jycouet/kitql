const { plugins, ...prettierConfig } = require('@theguild/prettier-config')

module.exports = {
  ...prettierConfig,
  semi: false,
  plugins: [...plugins, 'prettier-plugin-svelte', '@trivago/prettier-plugin-sort-imports'],
  importOrder: ['<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderSeparation: true,
}
