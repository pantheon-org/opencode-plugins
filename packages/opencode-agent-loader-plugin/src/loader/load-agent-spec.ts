/**
 * Load a single agent specification from a file
 */

import type { AgentSpecConstructor, AgentSpecLoadResult } from '../types';

import { isAgentSpecConstructor } from './is-agent-spec-constructor';
import { validateAgentSpec } from './validate-agent-spec';

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
      console.log(`[opencode-agent-loader-plugin] Loading agent spec: ${filePath}`);
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
          console.log(`[opencode-agent-loader-plugin] Loaded agent: ${spec.name}`);
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
    console.error(`[opencode-agent-loader-plugin] Failed to load ${filePath}:`, errorMessage);

    return {
      filePath,
      error: error instanceof Error ? error : new Error(errorMessage),
    };
  }
};
