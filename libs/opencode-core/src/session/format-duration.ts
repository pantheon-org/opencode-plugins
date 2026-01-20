/**
 * Format duration for user display
 */

/**
 * Format duration for user display
 *
 * Converts milliseconds to a human-readable format.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 *
 * @example
 * ```typescript
 * formatDuration(1500)   // "1.5s"
 * formatDuration(65000)  // "1m 5s"
 * formatDuration(125000) // "2m 5s"
 * ```
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};
