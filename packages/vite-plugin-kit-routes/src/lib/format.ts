export const format = (margin: { left?: number; top?: number; bottom?: number }, str: string) => {
  const m = {
    left: margin.left ?? 2,
    top: margin.top ?? 0,
    bottom: margin.bottom ?? 1,
  }

  if (str === '') return ''

  const strWithSpace = str
    .split('\n')
    .map(c => `${Array(m.left).fill(' ').join('')}${c}`)
    .join('\n')

  return (
    `${Array(m.top).fill('\n').join('')}` +
    `${strWithSpace}` +
    `${Array(m.bottom).fill('\n').join('')}`
  )
}

export const appendSp = `const appendSp = (sp?: Record<string, string | number | undefined>, prefix: '?' | '&' = '?') => {
  if (sp === undefined) return ''
  const mapping = Object.entries(sp)
    .filter(c => c[1] !== undefined)
    .map(c => [c[0], String(c[1])])

  const formated = new URLSearchParams(mapping).toString()
  if (formated) {
    return \`\${prefix}\${formated}\`
  }
  return ''
}`
