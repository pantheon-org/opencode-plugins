/**
 * OpenCode Configuration Utilities
 *
 * This module provides utilities for loading and managing OpenCode plugin configurations.
 */

// Export loader
export { type LoadConfigOptions, loadPluginConfig } from './loader.js';
// Export package utilities
export { getPackageName } from './package.js';
// Export path utilities
export { getConfigDir, getConfigPaths, getDataDir, getPluginStorageDir } from './paths.js';
// Export types
export type { PluginConfig, PluginSpecificConfig } from './types.js';
