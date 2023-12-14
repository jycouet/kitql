/**
 * Using https://github.com/BridgeAR/safe-stable-stringify because it's simply more robust and more performant!
 */
import { stringify } from './safe-stable-stringify.js'

/**
 * nice utility to stringify objects without spaces
 */
export function stry0(obj: object | null | undefined): string | null | undefined {
  return stry(obj, 0)
}

/**
 * nice utility to stringify objects (with 2 spaces by default, but you can change it)
 * Be careful, order of args are different than JSON.stringify
 */
export function stry(
  obj: object | null | undefined,
  space: string | number | undefined = 2,
  replacer?: (string | number)[] | null | undefined,
): string | null | undefined {
  if (obj === null) {
    return null
  }
  return stringify(obj, replacer, space)
}

/**
 * Check strict equality of 2 objects
 */
export function stryEq(obj1: object | null | undefined, obj2: object | null | undefined): boolean {
  return stry0(obj1) === stry0(obj2)
}
