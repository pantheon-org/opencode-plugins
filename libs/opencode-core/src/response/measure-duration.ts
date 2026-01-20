/**
 * Measure operation duration
 */

/**
 * Helper to wrap async operations with duration tracking
 *
 * @param operation - Async function to execute
 * @returns Tuple of [result, duration in ms]
 *
 * @example
 * ```typescript
 * const [data, duration] = await measureDuration(() =>
 *   client.getOrganizations()
 * );
 *
 * return success(data, { duration });
 * ```
 */
export const measureDuration = async <T>(operation: () => Promise<T>): Promise<[T, number]> => {
  const start = Date.now();
  const result = await operation();
  const duration = Date.now() - start;
  return [result, duration];
};
