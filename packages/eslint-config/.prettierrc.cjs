const { plugins, ...prettierConfig } = require('@theguild/prettier-config')

module.exports = {
  ...prettierConfig,
  semi: false,
  plugins: [...plugins, 'prettier-plugin-svelte'],
  importOrder: ['<THIRD_PARTY_MODULES>', '', '^(\\$houdini|@kitql|remult)(.*)$', '', '^[./]'],
  importOrderSeparation: true,
}
