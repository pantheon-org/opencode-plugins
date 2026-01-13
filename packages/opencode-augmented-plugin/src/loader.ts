/**
 * Utilities for discovering and loading agent specification files
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

import type { AgentSpec, AgentSpecConstructor, AgentSpecLoadResult, AugmentedPluginConfig } from './types';

/**
 * Default configuration for the plugin
 */
export const DEFAULT_CONFIG: Required<AugmentedPluginConfig> = {
  agentsDir: '.opencode/agents',
  patterns: ['**/*.ts', '**/*.js'],
  verbose: false,
};

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
    console.log(`[opencode-augmented-plugin] Scanning for agent specs in: ${agentsPath}`);
  }

  try {
    // Check if agents directory exists
    const dirStat = await stat(agentsPath);
    if (!dirStat.isDirectory()) {
      if (verbose) {
        console.log(`[opencode-augmented-plugin] Path is not a directory: ${agentsPath}`);
      }
      return [];
    }

    // Recursively find all TypeScript and JavaScript files
    const files = await findFiles(agentsPath, ['.ts', '.js']);

    if (verbose) {
      console.log(`[opencode-augmented-plugin] Found ${files.length} agent spec file(s)`);
    }

    return files;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      if (verbose) {
        console.log(`[opencode-augmented-plugin] Agents directory does not exist: ${agentsPath}`);
      }
      return [];
    }
    throw error;
  }
};

/**
 * Recursively find files with specified extensions
 */
const findFiles = async (dir: string, extensions: string[]): Promise<string[]> => {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      const subFiles = await findFiles(fullPath, extensions);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      // Check if file has one of the allowed extensions
      const hasExtension = extensions.some((ext) => entry.name.endsWith(ext));
      if (hasExtension) {
        files.push(fullPath);
      }
    }
  }

  return files;
};

/**
 * Load an agent spec from a file
 *
 * @param filePath - Absolute path to the agent spec file
 * @param verbose - Whether to log verbose information
 * @returns Result object with spec or error
 */
export const loadAgentSpec = async (filePath: string, verbose = false): Promise<AgentSpecLoadResult> => {
  try {
    if (verbose) {
      console.log(`[opencode-augmented-plugin] Loading agent spec: ${filePath}`);
    }

    // Dynamically import the file
    const module = await import(filePath);

    // Look for exported agent spec class
    // Try default export first, then named exports
    const exports = [module.default, ...Object.values(module)];

    for (const exported of exports) {
      if (isAgentSpecConstructor(exported)) {
        // Instantiate the class
        const spec = new (exported as AgentSpecConstructor)();

        // Validate the spec
        validateAgentSpec(spec, filePath);

        if (verbose) {
          console.log(`[opencode-augmented-plugin] Loaded agent: ${spec.name}`);
        }

        return {
          filePath,
          spec,
        };
      }
    }

    throw new Error(`No valid AgentSpec class found in ${filePath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[opencode-augmented-plugin] Failed to load ${filePath}:`, errorMessage);

    return {
      filePath,
      error: error instanceof Error ? error : new Error(errorMessage),
    };
  }
};

/**
 * Check if a value is a valid AgentSpec constructor
 */
export const isAgentSpecConstructor = (value: unknown): boolean => {
  if (typeof value !== 'function') {
    return false;
  }

  try {
    // Try to instantiate and check if it has the required properties
    const instance = new (value as AgentSpecConstructor)();
    return (
      typeof instance === 'object' &&
      instance !== null &&
      'name' in instance &&
      'config' in instance &&
      typeof instance.name === 'string' &&
      typeof instance.config === 'object'
    );
  } catch {
    return false;
  }
};

/**
 * Validate an agent spec instance
 *
 * @param spec - The agent spec to validate
 * @param filePath - Optional file path for error messages
 * @throws Error if validation fails
 */
export const validateAgentSpec = (spec: AgentSpec, filePath?: string): void => {
  const location = filePath ? ` in ${filePath}` : '';

  if (!spec.name || typeof spec.name !== 'string') {
    throw new Error(`Agent spec must have a name property${location}`);
  }

  if (!spec.config || typeof spec.config !== 'object') {
    throw new Error(`Agent spec must have a config property${location}`);
  }

  // Validate agent name format (kebab-case)
  if (!/^[a-z][a-z0-9-]*$/.test(spec.name)) {
    throw new Error(`Agent name must be kebab-case (lowercase letters, numbers, and hyphens)${location}`);
  }
};

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
      console.log('[opencode-augmented-plugin] No agent spec files found');
    }
    return [];
  }

  // Load all agent specs
  const results = await Promise.all(files.map((file) => loadAgentSpec(file, verbose)));

  // Filter out failed loads and return successful specs
  const specs = results.filter((result) => result.spec !== undefined).map((result) => result.spec!);

  const errorCount = results.length - specs.length;
  if (errorCount > 0) {
    console.warn(`[opencode-augmented-plugin] Failed to load ${errorCount} agent spec(s)`);
  }

  if (verbose) {
    console.log(`[opencode-augmented-plugin] Successfully loaded ${specs.length} agent spec(s)`);
  }

  return specs;
};
