const { plugins, ...prettierConfig } = require('@theguild/prettier-config')

module.exports = {
  ...prettierConfig,
  semi: false,
  arrowParens: 'always',
  plugins: [
    ...plugins,
    'prettier-plugin-svelte',
    'prettier-plugin-tailwindcss', // MUST come last
  ],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '',
    '^(\\$houdini)(.*)$', // special
    '^(remult)(.*)$', // special
    '^(remult-kit)(.*)$', // special
    '^(@kitql)(.*)$', // special
    '',
    '^(\\$env)(.*)$', // special sveltekit
    '^(\\$app)(.*)$', // special sveltekit
    '',
    '^(@app/common)(.*)$', // Aliases
    '^(\\$)(.*)$', // Aliases
    '',
    '^[./]', // inside
  ],
  importOrderSeparation: true,
}
