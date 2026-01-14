/**
 * Default configuration for the augmented plugin
 */

import type { AugmentedPluginConfig } from '../types';

export const DEFAULT_CONFIG: Required<AugmentedPluginConfig> = {
  agentsDir: '.opencode/agents',
  patterns: ['**/*.ts', '**/*.js'],
  verbose: false,
};
