/**
 * Create a summary message from counts
 */

/**
 * Create a summary message from counts
 *
 * Creates a human-readable summary from a map of counts.
 *
 * @param counts - Map of label to count
 * @param separator - Separator between items (default: ', ')
 * @returns Formatted summary string
 *
 * @example
 * ```typescript
 * createSummary({ Critical: 2, High: 5, Medium: 10 })
 * // "Critical: 2, High: 5, Medium: 10"
 *
 * createSummary({ errors: 3, warnings: 7 }, ' | ')
 * // "errors: 3 | warnings: 7"
 * ```
 */
export const createSummary = (counts: Record<string, number>, separator: string = ', '): string => {
  return Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([label, count]) => `${label}: ${count}`)
    .join(separator);
};
