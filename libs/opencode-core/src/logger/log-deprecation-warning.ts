/**
 * Log API deprecation warnings
 */

import type { PluginLogger } from '../types/logger-types.js';

/**
 * Log API deprecation warnings
 * Common pattern for tracking deprecated endpoints
 *
 * @param logger - Logger instance
 * @param endpoint - Deprecated endpoint path
 * @param options - Deprecation details
 *
 * @example
 * ```typescript
 * const log = createLogger({ plugin: 'snyk' });
 * logDeprecationWarning(log, '/v1/orgs', {
 *   sunset: '2026-12-31',
 *   replacement: '/v2/organizations',
 * });
 * ```
 */
export const logDeprecationWarning = (
  logger: PluginLogger,
  endpoint: string,
  options?: {
    sunset?: string;
    replacement?: string;
    message?: string;
  },
): void => {
  let message = `API endpoint deprecated: ${endpoint}`;

  const metadata: Record<string, unknown> = { endpoint };

  if (options?.sunset) {
    message += ` (sunset: ${options.sunset})`;
    metadata['sunset'] = options.sunset;
  }

  if (options?.replacement) {
    message += ` - use ${options.replacement} instead`;
    metadata['replacement'] = options.replacement;
  }

  if (options?.message) {
    metadata['deprecationMessage'] = options.message;
  }

  logger.warn(message, metadata);
};
