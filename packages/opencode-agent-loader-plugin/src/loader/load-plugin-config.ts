/**
 * Load plugin configuration from .opencode/plugin.json
 *
 * This module handles loading plugin-specific configuration from the
 * .opencode/plugin.json file in the project root.
 */

import * as path from 'node:path';

import type { AugmentedPluginConfig } from '../types';

import { DEFAULT_CONFIG } from './config';

/**
 * Load plugin configuration from .opencode/plugin.json
 *
 * Looks for configuration in the following order:
 * 1. Project-level: worktree/.opencode/plugin.json
 * 2. User-level: ~/.opencode/plugin.json (future enhancement)
 * 3. Defaults: If no config file exists
 *
 * @param worktree - Project root directory
 * @returns Plugin configuration merged with defaults
 */
export const loadPluginConfig = async (worktree: string): Promise<Required<AugmentedPluginConfig>> => {
  const configPath = path.join(worktree, '.opencode', 'plugin.json');

  try {
    const file = Bun.file(configPath);
    const exists = await file.exists();

    if (!exists) {
      // No config file, use defaults
      return DEFAULT_CONFIG;
    }

    const configData = await file.json();

    // Extract augmented-plugin specific config
    const pluginConfig =
      configData['@pantheon-org/opencode-agent-loader-plugin'] || configData['opencode-agent-loader-plugin'] || {};

    // Merge with defaults
    return {
      ...DEFAULT_CONFIG,
      ...pluginConfig,
    };
  } catch (error) {
    console.warn(`[opencode-agent-loader-plugin] Failed to load plugin config from ${configPath}:`, error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Create a default plugin.json file if it doesn't exist
 *
 * @param worktree - Project root directory
 * @returns True if file was created, false if it already exists
 */
export const createDefaultPluginConfig = async (worktree: string): Promise<boolean> => {
  const configPath = path.join(worktree, '.opencode', 'plugin.json');
  const file = Bun.file(configPath);

  const exists = await file.exists();
  if (exists) {
    return false;
  }

  const defaultConfig = {
    '@pantheon-org/opencode-agent-loader-plugin': {
      agentsDir: '.opencode/agent',
      verbose: false,
      enableDefaultAgents: true,
      disabledDefaultAgents: [],
    },
  };

  try {
    await Bun.write(configPath, JSON.stringify(defaultConfig, null, 2));
    return true;
  } catch (error) {
    console.error(`[opencode-agent-loader-plugin] Failed to create plugin config:`, error);
    return false;
  }
};
