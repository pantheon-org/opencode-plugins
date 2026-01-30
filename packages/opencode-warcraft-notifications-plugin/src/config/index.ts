/**
 * Configuration module for OpenCode Warcraft Notifications plugin
 *
 * This module provides configuration loading, path resolution, and type definitions
 * for the plugin configuration system.
 */

// Re-export loader
export { loadPluginConfig } from './loader.js';
// Re-export package utilities
export { getPackageName } from './package.js';
// Re-export path utilities
export { DEFAULT_DATA_DIR, getConfigDir, getDefaultDataDir, getDefaultSoundsDir, SOUNDS_SUBDIR } from './paths.js';
// Re-export types
export type { Faction, PluginConfig, WarcraftNotificationConfig } from './types.js';
