/**
 * Log authentication warnings for deprecated credential patterns
 */

import type { PluginLogger } from '../types/logger-types.js';

/**
 * Log authentication warnings for deprecated credential patterns
 *
 * @param logger - Logger instance
 * @param authType - Type of deprecated auth (e.g., 'apiToken', 'envVar')
 * @param provider - Provider name
 *
 * @example
 * ```typescript
 * const log = createLogger({ plugin: 'snyk' });
 * if (args.apiToken) {
 *   logDeprecatedAuth(log, 'apiToken', 'snyk');
 * }
 * ```
 */
export const logDeprecatedAuth = (logger: PluginLogger, authType: string, provider: string): void => {
  logger.warn(`Deprecated authentication method: ${authType}`, {
    authType,
    provider,
    migration: `Use: opencode auth ${provider}`,
    deprecationVersion: '2.0.0',
    removalVersion: '3.0.0',
  });
};
