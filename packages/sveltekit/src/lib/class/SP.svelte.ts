import { goto } from '$app/navigation'
import { page } from '$app/state'

const CONFIG_DELIMITER = ';'

// Type definitions for supported parameter types
type ParamType = 'string' | 'number' | 'boolean' | 'array' | 'object'

// Parameter definition interface with proper type support
interface ParamDefinition<TValue> {
  type?: ParamType
  /** Alternative key to use in URL search params */
  key?: string
  /** Custom function to convert value to URL string */
  encode?: (value: TValue) => string | undefined
  /** Custom function to parse URL value to the correct type */
  decode?: (value: string | undefined) => TValue
}

/**
 * SearchParams class for handling URL search parameters with Svelte 5 runes
 * Provides automatic binding and URL updates
 */
export class SP<T extends Record<string, any>> {
  // Internal state container
  private paramValues = $state<Record<string, any>>({})

  // Created proxy object for direct param access
  public sp: T = {} as T

  // The definitions of parameters with proper typing for each key in T
  private config: { [K in keyof T]: ParamDefinition<T[K]> }

  // Mapping between property names and URL parameter keys
  private keyMap: Record<string, string> = {}

  /**
   * Create a new SearchParams instance
   * @param defaults Object with default values (also defines the structure of type T)
   * @param options Object containing parameter definitions and configuration
   */
  constructor(
    private defaults: T,
    private options: {
      config?: Partial<{ [K in keyof T]: Partial<ParamDefinition<T[K]>> }>
      gotoOpts?: Parameters<typeof goto>[1]
    } = {},
  ) {
    // Initialize definitions from defaults
    this.config = {} as { [K in keyof T]: ParamDefinition<T[K]> }

    // Create definitions based on default values
    for (const [key, value] of Object.entries(defaults)) {
      // Determine the type based on the default value
      let type: ParamType = 'string'
      if (typeof value === 'number') type = 'number'
      else if (typeof value === 'boolean') type = 'boolean'
      else if (Array.isArray(value)) type = 'array'
      else if (typeof value === 'object' && value !== null) type = 'object'

      // Create base definition
      this.config[key as keyof T] = {
        type,
      } as ParamDefinition<T[keyof T]>
    }

    // Apply custom definitions on top of auto-generated ones
    if (options.config) {
      for (const [key, def] of Object.entries(options.config)) {
        if (this.config[key as keyof T]) {
          this.config[key as keyof T] = {
            ...this.config[key as keyof T],
            ...def,
          } as ParamDefinition<T[keyof T]>
        }
      }
    }

    // Set keyMap
    for (const [key, def] of Object.entries(this.config)) {
      // Build key mapping for URL params
      this.keyMap[key] = def.key || key
    }

    // Initialize values from definitions
    for (const [key, def] of Object.entries(this.config)) {
      this.paramValues[key] = defaults[key as keyof T]
    }

    // Create proxy object for direct parameter access
    for (const key of Object.keys(this.config)) {
      Object.defineProperty(this.sp, key, {
        get: () => this.paramValues[key],
        set: (value) => {
          this.paramValues[key] = value
        },
        enumerable: true,
      })
    }

    this.fromURL()

    if (typeof window === 'undefined') return

    $effect(() => {
      this.toURL()
    })
  }

  /**
   * Load parameter values from URL
   */
  private fromURL(): void {
    const params = page.url.searchParams

    for (const [propKey, tmpDef] of Object.entries(this.config)) {
      const def = tmpDef as ParamDefinition<T[keyof T]>
      const urlKey = this.keyMap[propKey] // Get the URL parameter key
      const paramValue = params.get(urlKey)

      if (paramValue !== null) {
        if (def.decode) {
          this.paramValues[propKey] = def.decode(paramValue)
          continue
        }

        // Otherwise use default conversion based on type
        switch (def.type) {
          case 'number':
            const num = parseFloat(paramValue)
            if (!isNaN(num)) {
              this.paramValues[propKey] = num
            }
            break
          case 'boolean':
            this.paramValues[propKey] = paramValue === 'true'
            break
          case 'array':
            this.paramValues[propKey] = paramValue.split(CONFIG_DELIMITER).filter(Boolean)
            break
          case 'object':
            try {
              this.paramValues[propKey] = JSON.parse(paramValue)
            } catch (e) {
              console.error(`Error parsing JSON for param ${propKey}:`, e)
              // Keep default value on error
            }
            break
          case 'string':
          default:
            this.paramValues[propKey] = paramValue
            break
        }
      }
    }
  }

  /**
   * Update URL with current parameter values
   */
  private toURL(): void {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)

    for (const [propKey, value] of Object.entries(this.paramValues)) {
      // Skip undefined or null values
      if (value === undefined || value === null) continue

      // Skip values that match their defaults
      if (JSON.stringify(value) === JSON.stringify(this.defaults[propKey as keyof T])) {
        params.delete(this.keyMap[propKey])
        continue
      }

      // Get the definition and URL key
      const def = this.config[propKey as keyof T]
      if (!def) continue

      const urlKey = this.keyMap[propKey]

      if (def.encode) {
        const toSet = def.encode(value)
        if (toSet) {
          params.set(urlKey, toSet)
        }
        continue
      }

      // Otherwise use default conversion based on type
      switch (def.type) {
        case 'array':
          params.set(urlKey, Array.isArray(value) ? value.join(CONFIG_DELIMITER) : String(value))
          break
        case 'object':
          params.set(urlKey, JSON.stringify(value))
          break
        default:
          // Handle primitives
          params.set(urlKey, String(value))
          break
      }
    }

    const strSearch = params.toString() ? '?' + params.toString() : ''

    // Don't do the goto if the search params haven't changed!
    if (strSearch === window.location.search) return

    goto(`${window.location.pathname}${strSearch}`, {
      keepFocus: true,
      replaceState: true,
      ...this.options.gotoOpts,
    })
  }

  /**
   * Reset all parameters to their default values
   */
  reset(): void {
    for (const [key, def] of Object.entries(this.config)) {
      this.paramValues[key] = this.defaults[key as keyof T]
    }
  }
}
