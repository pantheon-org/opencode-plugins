/**
 * Discover agent specification files in the workspace
 */

import { stat } from 'fs/promises';
import { join } from 'path';

import type { AugmentedPluginConfig } from '../types';

import { DEFAULT_CONFIG } from './config';
import { findFiles } from './find-files';

/**
 * Discover agent spec files in the specified directory
 *
 * @param worktree - The workspace root directory
 * @param config - Plugin configuration
 * @returns Array of absolute file paths to agent spec files
 */
export const discoverAgentSpecs = async (worktree: string, config: AugmentedPluginConfig = {}): Promise<string[]> => {
  const { agentsDir, verbose } = { ...DEFAULT_CONFIG, ...config };
  const agentsPath = join(worktree, agentsDir);

  if (verbose) {
    console.log(`[opencode-agent-loader-plugin] Scanning for agent specs in: ${agentsPath}`);
  }

  try {
    // Check if agents directory exists
    const dirStat = await stat(agentsPath);
    if (!dirStat.isDirectory()) {
      if (verbose) {
        console.log(`[opencode-agent-loader-plugin] Path is not a directory: ${agentsPath}`);
      }
      return [];
    }

    // Recursively find all TypeScript and JavaScript files
    const files = await findFiles(agentsPath, ['.ts', '.js']);

    if (verbose) {
      console.log(`[opencode-agent-loader-plugin] Found ${files.length} agent spec file(s)`);
    }

    return files;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      if (verbose) {
        console.log(`[opencode-agent-loader-plugin] Agents directory does not exist: ${agentsPath}`);
      }
      return [];
    }
    throw error;
  }
};
