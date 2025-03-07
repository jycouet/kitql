import type { Linter } from 'eslint';

export default config;

/**
 * KitQL's ESLint configuration with customizable options
 * 
 * @param options - Configuration options
 * @returns ESLint configuration array
 */
export function kitql(options?: {
	/**
	 * Whether to include pnpm catalogs rules
	 * @default true
	 */
	pnpmCatalogs?: boolean;
}): Linter.Config[];