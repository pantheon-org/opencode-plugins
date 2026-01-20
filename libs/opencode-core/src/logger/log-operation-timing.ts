/**
 * Log operation timing with automatic performance warnings
 */

import type { PluginLogger } from '../types/logger-types.js';

/**
 * Log operation timing with automatic performance warnings
 *
 * @param logger - Logger instance
 * @param operation - Operation name
 * @param duration - Duration in milliseconds
 * @param threshold - Warning threshold in milliseconds (default: 5000)
 *
 * @example
 * ```typescript
 * const log = createLogger({ plugin: 'jira' });
 * const start = Date.now();
 * await fetchIssues();
 * logOperationTiming(log, 'fetch-issues', Date.now() - start);
 * ```
 */
export const logOperationTiming = (
  logger: PluginLogger,
  operation: string,
  duration: number,
  threshold = 5000,
): void => {
  const metadata = {
    operation,
    duration,
    unit: 'ms',
  };

  if (duration > threshold) {
    logger.warn('Slow operation detected', metadata);
  } else {
    logger.debug('Operation completed', metadata);
  }
};
