import { toPascalCase } from './formatString.js'

export function getPrismaEnum(lines: string[]): Record<string, string[]> {
  const enums = {}

  let currentEnum = ''
  lines.forEach((line: string) => {
    if (currentEnum !== '') {
      if (line.includes('}')) {
        currentEnum = ''
      } else {
        enums[currentEnum].push(line.trim())
      }
    }
    if (line.startsWith('enum')) {
      const [, enumName] = line.split(' ')
      currentEnum = toPascalCase(enumName)
      enums[currentEnum] = []
    }
    // console.log(`line`, line);
  })

  return enums
}
