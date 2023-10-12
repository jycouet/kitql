/**
 * Using https://github.com/BridgeAR/safe-stable-stringify because it's simply more robust and more performant!
 */
import { stringify } from './safe-stable-stringify/tmp.js'

/**
 * nice utility to stringify objects without spaces
 */
export function stry0(obj: Object | null | undefined): string | null | undefined {
  return stry(obj, 0)
}

/**
 * nice utility to stringify objects (with 2 spaces by default, but you can change it)
 * Be careful, order of args are different than JSON.stringify
 */
export function stry(
  obj: Object | null | undefined,
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
export function stryEq(obj1: Object | null | undefined, obj2: Object | null | undefined): boolean {
  return stry(obj1, 0) === stry(obj2, 0)
}
