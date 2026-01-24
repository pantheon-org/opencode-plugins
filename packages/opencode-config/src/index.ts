/**
 * OpenCode Configuration Utilities
 *
 * This module provides utilities for loading and managing OpenCode plugin configurations.
 */

// Export types
export type { PluginConfig, PluginSpecificConfig } from './types.js';

// Export path utilities
export { getConfigDir, getDataDir, getPluginStorageDir, getConfigPaths } from './paths.js';

// Export package utilities
export { getPackageName } from './package.js';

// Export loader
export { loadPluginConfig, type LoadConfigOptions } from './loader.js';
