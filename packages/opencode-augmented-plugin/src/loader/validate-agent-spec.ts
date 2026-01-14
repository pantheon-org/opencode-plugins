/**
 * Validate agent spec name format (kebab-case)
 */

import type { AgentSpec } from '../types';

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
