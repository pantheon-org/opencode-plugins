/**
 * Log API rate limit warnings
 */

import type { PluginLogger } from '../types/logger-types.js';

/**
 * Log API rate limit warnings
 * Common pattern across many APIs
 *
 * @param logger - Logger instance
 * @param rateLimit - Rate limit information
 *
 * @example
 * ```typescript
 * const log = createLogger({ plugin: 'snyk' });
 * logRateLimitWarning(log, {
 *   limit: 60,
 *   remaining: 5,
 *   reset: 1234567890,
 * });
 * ```
 */
export const logRateLimitWarning = (
  logger: PluginLogger,
  rateLimit: {
    limit: number;
    remaining: number;
    reset: number;
  },
): void => {
  const percentRemaining = (rateLimit.remaining / rateLimit.limit) * 100;

  if (percentRemaining < 10) {
    const resetDate = new Date(rateLimit.reset * 1000);
    logger.warn('API rate limit approaching', {
      remaining: rateLimit.remaining,
      limit: rateLimit.limit,
      resetAt: resetDate.toISOString(),
    });
  }
};
