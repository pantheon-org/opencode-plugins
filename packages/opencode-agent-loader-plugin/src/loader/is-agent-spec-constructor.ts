/**
 * Type guard to check if a value is a valid AgentSpec constructor
 */

import type { AgentSpecConstructor } from '../types';

/**
 * Check if a value is a valid AgentSpec constructor
 *
 * @param value - Value to check
 * @returns True if value is a valid AgentSpec constructor
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
