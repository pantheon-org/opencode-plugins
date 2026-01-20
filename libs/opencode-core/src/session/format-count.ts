/**
 * Format count with label
 */

/**
 * Format count with label
 *
 * Formats a count with proper singular/plural label.
 *
 * @param count - The count value
 * @param singular - Singular form of the label
 * @param plural - Plural form of the label (defaults to singular + 's')
 * @returns Formatted count string
 *
 * @example
 * ```typescript
 * formatCount(0, 'issue')   // "0 issues"
 * formatCount(1, 'issue')   // "1 issue"
 * formatCount(5, 'issue')   // "5 issues"
 * formatCount(1, 'repository', 'repositories') // "1 repository"
 * ```
 */
export const formatCount = (count: number, singular: string, plural?: string): string => {
  const label = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${label}`;
};
