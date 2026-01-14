/**
 * Load all agent specifications from the workspace
 */

import type { AgentSpec, AugmentedPluginConfig } from '../types';

import { DEFAULT_CONFIG } from './config';
import { discoverAgentSpecs } from './discover-agent-specs';
import { loadAgentSpec } from './load-agent-spec';

/**
 * Load all agent specs from discovered files
 *
 * @param worktree - The workspace root directory
 * @param config - Plugin configuration
 * @returns Array of successfully loaded agent specs
 */
export const loadAllAgentSpecs = async (worktree: string, config: AugmentedPluginConfig = {}): Promise<AgentSpec[]> => {
  const { verbose } = { ...DEFAULT_CONFIG, ...config };
  const files = await discoverAgentSpecs(worktree, config);

  if (files.length === 0) {
    if (verbose) {
      console.log('[opencode-agent-loader-plugin] No agent spec files found');
    }
    return [];
  }

  // Load all agent specs
  const results = await Promise.all(files.map((file) => loadAgentSpec(file, verbose)));

  // Filter out failed loads and return successful specs
  const specs = results.filter((result) => result.spec !== undefined).map((result) => result.spec!);

  const errorCount = results.length - specs.length;
  if (errorCount > 0) {
    console.warn(`[opencode-agent-loader-plugin] Failed to load ${errorCount} agent spec(s)`);
  }

  if (verbose) {
    console.log(`[opencode-agent-loader-plugin] Successfully loaded ${specs.length} agent spec(s)`);
  }

  return specs;
};
