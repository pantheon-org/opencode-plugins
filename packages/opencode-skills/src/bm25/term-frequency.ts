/**
 * Term Frequency Calculation
 *
 * Calculate how many times a term appears in a document.
 */

/**
 * Calculate term frequency in a document
 *
 * @param term - Term to count
 * @param document - Tokenized document
 * @returns Number of occurrences of the term
 *
 * @example
 * ```typescript
 * termFrequency('test', ['test', 'driven', 'test'])
 * // => 2
 * ```
 */
export const termFrequency = (term: string, document: string[]): number => {
  return document.filter((t) => t === term).length;
};
