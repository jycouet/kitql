export function pad(num: number, size = 2): string {
  const s = '000000000' + num
  return s.substring(s.length - size)
}

/**
 * toPascalCase
 * @param {String} input
 * @returns A string that has been converted into Pascal Case for keeping with the React Naming convention required for naming Components.
 * @see https://stackoverflow.com/a/53952925/13301381
 * @author kalicki2K
 */
export function toPascalCase(input: string): string {
  return `${input}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w+)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`,
    )
    .replace(new RegExp(/\s/, 'g'), '')
    .replace(new RegExp(/\w/), s => s.toUpperCase())
}
