/**
 * Rank Skills by BM25
 *
 * Rank all skills by their BM25 relevance scores for a given query.
 */

import { calculateBM25Score } from './calculate-score';
import type { BM25Config, BM25Index } from './types';
import { DEFAULT_BM25_CONFIG } from './types';

/**
 * Rank skills by BM25 relevance to a query
 *
 * @param query - User message/query
 * @param skillNames - Array of skill names (must match index order)
 * @param index - Precomputed BM25 index
 * @param config - BM25 configuration
 * @returns Array of [skillName, score] tuples sorted by relevance (descending)
 *
 * @example
 * ```typescript
 * const ranked = rankSkillsByBM25(
 *   'How do I write TypeScript tests?',
 *   ['typescript-tdd', 'bun-runtime'],
 *   index
 * );
 * // => [['typescript-tdd', 12.5], ['bun-runtime', 3.2]]
 * ```
 */
export const rankSkillsByBM25 = (
  query: string,
  skillNames: string[],
  index: BM25Index,
  config: BM25Config = {},
): Array<[string, number]> => {
  const { threshold } = { ...DEFAULT_BM25_CONFIG, ...config };

  const scores: Array<[string, number]> = [];

  for (let i = 0; i < skillNames.length; i++) {
    const score = calculateBM25Score(query, i, index, config);

    // Only include scores above threshold
    if (score >= threshold) {
      scores.push([skillNames[i], score]);
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b[1] - a[1]);

  return scores;
};
