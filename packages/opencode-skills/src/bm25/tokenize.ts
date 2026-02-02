/**
 * Tokenize Text
 *
 * Tokenize text into lowercase words, removing punctuation while preserving hyphens.
 */

/**
 * Tokenize text into lowercase words, removing punctuation
 *
 * @param text - Input text to tokenize
 * @returns Array of lowercase tokens
 *
 * @example
 * ```typescript
 * tokenize('Hello World!')
 * // => ['hello', 'world']
 *
 * tokenize('typescript-tdd')
 * // => ['typescript-tdd']
 * ```
 */
export const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Keep hyphens for skill names
    .split(/\s+/)
    .filter((token) => token.length > 0);
};
