#!/usr/bin/env node

import path from 'node:path';

const currentPath = process.cwd();

async function loadConfig() {
	try {
		const configPath = path.resolve(currentPath, 'vite.config.ts');
		const { _kitRoutesConfig } = await import(configPath);

		if (!_kitRoutesConfig) {
			console.error(`There is no 'export const _kitRoutesConfig' in 'vite.config'`);
			return null;
		}

		console.info('Config loaded:', _kitRoutesConfig);
		return _kitRoutesConfig;
	} catch (error) {
		console.error('Error loading config:', error);
		return null;
	}
}

// Load and process the config
loadConfig().then((config) => {
	if (config) {
		console.info('Successfully loaded config');
	} else {
		console.error('Failed to load config');
	}
});