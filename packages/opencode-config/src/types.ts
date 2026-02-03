/**
 * Generic plugin configuration types for OpenCode
 */

/**
 * Generic plugin configuration file structure
 * Supports nested plugin configurations where each plugin is identified by its name
 */
export interface PluginConfig {
  [pluginName: string]: unknown;
}

/**
 * Configuration for a specific plugin
 * Plugins can define their own specific configuration schema
 */
export type PluginSpecificConfig = Record<string, unknown>;
