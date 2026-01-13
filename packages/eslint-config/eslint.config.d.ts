import type { Linter } from 'eslint'

export interface PnpmCatalogsConfig {
	/** Whether to enable pnpm catalogs rules */
	enable?: boolean
	/** Files to apply JSON rules to */
	json_files?: string[]
	/** JSON rules configuration */
	json_rules?: Record<string, any>
	/** Files to apply YAML rules to */
	yaml_files?: string[]
	/** YAML rules configuration */
	yaml_rules?: Record<string, any>
}

export interface OxlintConfig {
	/** Whether to enable oxlint */
	enable?: boolean
}

export interface KitqlOptions {
	/** Configuration object for pnpm catalogs */
	pnpmCatalogs?: PnpmCatalogsConfig
	/** Configuration object for oxlint */
	oxlint?: OxlintConfig
	/** Configuration object for svelte */
	svelteConfig?: Record<string, any>
}

/**
 * Creates a KitQL ESLint configuration
 */
export function kitql(options?: KitqlOptions): Linter.Config[]

declare const config: Linter.Config[]
export default config
