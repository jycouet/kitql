import { goto } from '$app/navigation'
import { page } from '$app/state'

import { debounce } from '../helpers/debounce.js'

const CONFIG_DELIMITER = ';'

// Type definitions for supported parameter types
type ParamType = 'string' | 'number' | 'boolean' | 'array' | 'object'

// Parameter definition interface with proper type support
export interface ParamDefinition<TValue> {
	type?: ParamType
	/** Alternative key to use in URL search params */
	key?: string
	/** Custom function to convert value to URL string (for storage in URL only) */
	encode?: (obj: TValue) => string | undefined
	/** Custom function to parse URL value to the correct type (for internal use) */
	decode?: (str: string | undefined) => TValue
	/** Debounce the URL update for this parameter (milliseconds or true for default) */
	debounce?: number | boolean
}

/**
 * SearchParams class for handling URL search parameters with Svelte 5 runes
 * Provides automatic binding and URL updates
 */
export class SP<T extends Record<string, any>> {
	// Internal state container - always stores decoded objects
	private paramValues = $state<Record<string, any>>({})

	// Track debounced values separately - also always decoded objects
	private debouncedValues = $state<Record<string, any>>({})

	// Flag indicating when debouncing is active
	computing = $state(false)

	// Store debounced toURL functions for each parameter
	private debouncedToURL: Record<string, (...args: any[]) => void> = {}

	// Shared debounce mechanism for all parameters
	private sharedDebouncePending = $state(false)
	private activeDebounces = $state<Record<string, boolean>>({})
	private longestDebounceTime = $state(0)

	// This will be called after all individual debounces have completed
	private finalizeDebounce = () => {
		// Only proceed if all tracked debounces have completed
		if (Object.values(this.activeDebounces).some((active) => active)) {
			return
		}

		// Apply all pending changes
		for (const key of Object.keys(this.paramValues)) {
			this.debouncedValues[key] = this.paramValues[key]
		}

		// Update URL and reset flags
		this.toURL()
		this.sharedDebouncePending = false
		this.computing = false
		this.longestDebounceTime = 0
	}

	// Created proxy object for direct param access
	private _obj: T & {
		computed: T
		rawStr: Record<keyof T, string | undefined>
	} = {} as T & {
		computed: T
		rawStr: Record<keyof T, string | undefined>
	}

	// Expose public properties via getters
	get obj(): T {
		return this._obj
	}

	get computed(): T {
		return this._obj.computed
	}

	get rawStr(): Record<keyof T, string | undefined> {
		return this._obj.rawStr
	}

	// Config for each param, with defaults applied
	private config: { [K in keyof T]: ParamDefinition<T[K]> }

	// Maps from URL key to object key
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

		// Initialize values from definitions with default values
		// Always store the actual objects, not their string representations
		for (const [key] of Object.entries(this.config)) {
			this.paramValues[key] = defaults[key as keyof T]
			this.debouncedValues[key] = defaults[key as keyof T]
			this.activeDebounces[key] = false

			// Create debounced functions for each parameter that needs it
			const def = this.config[key as keyof T]
			if (def.debounce) {
				const delay = typeof def.debounce === 'number' ? def.debounce : 444

				this.debouncedToURL[key] = debounce(() => {
					// Mark this specific debounce as complete
					this.activeDebounces[key] = false

					// Check if this is the last active debounce
					this.finalizeDebounce()
				}, delay)
			}
		}

		// Create the nested structure for obj.computed and obj.rawStr
		this._obj.computed = {} as T
		this._obj.rawStr = {} as Record<keyof T, string | undefined>

		// Create proxy object for direct parameter access
		for (const key of Object.keys(this.config)) {
			// Main parameter accessor - This always returns the decoded object
			Object.defineProperty(this._obj, key, {
				get: () => this.paramValues[key],
				set: (value) => {
					// Always store the actual object value
					this.paramValues[key] = value

					const def = this.config[key as keyof T]
					if (def.debounce) {
						// Start computing
						this.computing = true

						// Track this debounce
						const delay = typeof def.debounce === 'number' ? def.debounce : 444
						this.activeDebounces[key] = true
						this.sharedDebouncePending = true

						// Track the longest debounce time
						if (delay > this.longestDebounceTime) {
							this.longestDebounceTime = delay
						}

						// Trigger individual debounce
						if (this.debouncedToURL[key]) {
							this.debouncedToURL[key]()
						}
					} else {
						// No debounce for this parameter, update immediately
						this.debouncedValues[key] = value

						// If there are no active debounces, just update right away
						if (!this.sharedDebouncePending) {
							this.toURL()
						}
					}
				},
				enumerable: true,
			})

			// Add debounced value accessor in the computed object
			Object.defineProperty(this._obj.computed, key, {
				get: () => this.debouncedValues[key],
				enumerable: true,
			})

			// Add ID accessor in the rawStr object
			Object.defineProperty(this._obj.rawStr, key, {
				get: () => {
					const value = this.debouncedValues[key]
					const def = this.config[key as keyof T]

					// Skip undefined or null values
					if (value === undefined || value === null) {
						return undefined
					}

					// If there's a custom encode function, use it
					if (def.encode) {
						return def.encode(value)
					}

					// Otherwise use default conversion based on type
					switch (def.type) {
						case 'array':
							return Array.isArray(value) ? value.join(CONFIG_DELIMITER) : String(value)
						case 'object':
							return JSON.stringify(value)
						default:
							// Handle primitives
							return String(value)
					}
				},
				set: (idValue) => {
					const def = this.config[key as keyof T]

					// If the ID is undefined, set the value to undefined
					if (idValue === undefined) {
						this.paramValues[key] = undefined
						this.debouncedValues[key] = undefined
						this.toURL()
						return
					}

					// We need to convert the ID to the full object
					// If there's a decode function, we can use that
					if (def.decode) {
						// Use decode to convert from the string ID to the full object
						const fullObject = def.decode(idValue.toString())
						this.paramValues[key] = fullObject
						this.debouncedValues[key] = fullObject
						this.toURL()
					} else {
						// No decode function, just set the ID value directly
						let value: any = idValue

						// Try to convert based on type
						switch (def.type) {
							case 'number':
								value = parseFloat(idValue.toString())
								if (isNaN(value)) value = idValue
								break
							case 'boolean':
								value = idValue === 'true'
								break
							case 'array':
								if (typeof idValue === 'string') {
									value = idValue.split(CONFIG_DELIMITER).filter(Boolean)
								}
								break
							case 'object':
								if (typeof idValue === 'string') {
									try {
										value = JSON.parse(idValue)
									} catch (e) {
										console.error(`Error parsing JSON for param ${key}:`, e)
										value = idValue
									}
								}
								break
						}

						this.paramValues[key] = value
						this.debouncedValues[key] = value
						this.toURL()
					}
				},
				enumerable: true,
			})
		}

		// Load values from URL after setting up the structure
		this.fromURL()
	}

	/**
	 * Load parameter values from URL
	 * Always store the decoded objects, not the URL string representations
	 */
	private fromURL(): void {
		const params = page.url.searchParams

		for (const [propKey, tmpDef] of Object.entries(this.config)) {
			const def = tmpDef as ParamDefinition<T[keyof T]>
			const urlKey = this.keyMap[propKey] // Get the URL parameter key
			const paramValue = params.get(urlKey)

			if (paramValue !== null) {
				// If there is a decode function, always use it to get the proper object
				if (def.decode) {
					const decodedValue = def.decode(paramValue)
					this.paramValues[propKey] = decodedValue
					this.debouncedValues[propKey] = decodedValue
					continue
				}

				// Otherwise use default conversion based on type
				switch (def.type) {
					case 'number': {
						const num = parseFloat(paramValue)
						if (!isNaN(num)) {
							this.paramValues[propKey] = num
							this.debouncedValues[propKey] = num
						}
						break
					}
					case 'boolean':
						this.paramValues[propKey] = paramValue === 'true'
						this.debouncedValues[propKey] = this.paramValues[propKey]
						break
					case 'array':
						this.paramValues[propKey] = paramValue.split(CONFIG_DELIMITER).filter(Boolean)
						this.debouncedValues[propKey] = this.paramValues[propKey]
						break
					case 'object':
						try {
							this.paramValues[propKey] = JSON.parse(paramValue)
							this.debouncedValues[propKey] = this.paramValues[propKey]
						} catch (e) {
							console.error(`Error parsing JSON for param ${propKey}:`, e)
							// Keep default value on error
						}
						break
					case 'string':
					default:
						this.paramValues[propKey] = paramValue
						this.debouncedValues[propKey] = paramValue
						break
				}
			}
		}
	}

	/**
	 * Update URL with current parameter values
	 * Only uses encoding for URL representation, doesn't modify internal state
	 */
	private toURL(): void {
		if (typeof window === 'undefined') return

		// If there's a shared debounce pending, don't update URL yet
		if (this.sharedDebouncePending) {
			return
		}

		const params = new URLSearchParams(window.location.search)

		for (const [propKey, value] of Object.entries(this.debouncedValues)) {
			// Skip undefined or null values
			if (value === undefined || value === null) {
				params.delete(this.keyMap[propKey])
				continue
			}

			// Get the definition and URL key
			const def = this.config[propKey as keyof T]
			if (!def) continue

			const urlKey = this.keyMap[propKey]
			const defaultValue = this.defaults[propKey as keyof T]

			// Encode the current value
			let encodedValue: string | undefined
			if (def.encode) {
				encodedValue = def.encode(value)
				if (!encodedValue) {
					params.delete(urlKey)
					continue
				}
			} else {
				// Otherwise use default conversion based on type
				switch (def.type) {
					case 'array':
						encodedValue = Array.isArray(value) ? value.join(CONFIG_DELIMITER) : String(value)
						break
					case 'object':
						encodedValue = JSON.stringify(value)
						break
					default:
						// Handle primitives
						encodedValue = String(value)
						break
				}
			}

			// Encode the default value for comparison
			let encodedDefault: string | undefined
			if (defaultValue !== undefined && defaultValue !== null) {
				if (def.encode) {
					encodedDefault = def.encode(defaultValue)
				} else {
					switch (def.type) {
						case 'array':
							encodedDefault = Array.isArray(defaultValue)
								? defaultValue.join(CONFIG_DELIMITER)
								: String(defaultValue)
							break
						case 'object':
							encodedDefault = JSON.stringify(defaultValue)
							break
						default:
							encodedDefault = String(defaultValue)
							break
					}
				}
			}

			// Skip values that match their encoded defaults
			if (encodedValue === encodedDefault) {
				params.delete(urlKey)
				continue
			}

			// Set the encoded value in URL
			params.set(urlKey, encodedValue)
		}

		const strSearch = params.toString() ? '?' + params.toString() : ''

		// Don't do the goto if the search params haven't changed!
		if (strSearch === window.location.search) return

		goto(`${window.location.pathname}${strSearch}`, {
			keepFocus: true,
			replaceState: true,
			noScroll: true,
			...this.options.gotoOpts,
		})

		// Reset computing flag after URL update is complete
		this.computing = false
	}

	/**
	 * Reset all parameters to their default values
	 */
	reset(): void {
		// Reset both sets of values to defaults immediately
		for (const [key] of Object.entries(this.config)) {
			this.paramValues[key] = this.defaults[key as keyof T]
			this.debouncedValues[key] = this.defaults[key as keyof T]
			this.activeDebounces[key] = false
		}

		// Cancel any pending debounce
		this.sharedDebouncePending = false
		this.longestDebounceTime = 0

		// Update URL immediately without debounce
		this.computing = false
		this.toURL()
	}
}
