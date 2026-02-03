/**
 * Escape Regex
 *
 * Escape special regex characters in a string for safe pattern matching.
 */

/**
 * Escape special regex characters in a string
 *
 * @param str - String to escape
 * @returns Escaped string safe for use in RegExp
 *
 * @example
 * ```typescript
 * escapeRegex('test.txt')
 * // => 'test\\.txt'
 *
 * escapeRegex('skill-name')
 * // => 'skill-name'
 * ```
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
