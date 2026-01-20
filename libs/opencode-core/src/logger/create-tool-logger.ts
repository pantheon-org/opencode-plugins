/**
 * Create a tool-specific logger
 */

import type { PluginLogger } from '../types/logger-types.js';

import { createLogger } from './create-logger.js';

/**
 * Create a tool-specific logger
 * Convenience wrapper for createLogger with tool context
 *
 * @param plugin - Plugin name
 * @param tool - Tool name
 * @returns Logger instance for the specific tool
 *
 * @example
 * ```typescript
 * const log = createToolLogger('snyk', 'list-organizations');
 * log.info('Starting organization fetch', { limit: 100 });
 * ```
 */
export const createToolLogger = (plugin: string, tool: string): PluginLogger => {
  return createLogger({ plugin, tool });
};
