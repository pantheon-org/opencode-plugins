/**
 * Get Top Skills by BM25
 *
 * Get the top N most relevant skills for a query using BM25 scoring.
 */

import { rankSkillsByBM25 } from './rank-skills';
import type { BM25Config, BM25Index } from './types';

/**
 * Get top N skills by BM25 relevance
 *
 * @param query - User message/query
 * @param skillNames - Array of skill names
 * @param index - Precomputed BM25 index
 * @param topN - Number of top results to return
 * @param config - BM25 configuration
 * @returns Array of top N skill names by relevance
 *
 * @example
 * ```typescript
 * const topSkills = getTopSkillsByBM25(
 *   'How do I write TypeScript tests?',
 *   ['typescript-tdd', 'bun-runtime', 'react-testing'],
 *   index,
 *   2
 * );
 * // => ['typescript-tdd', 'react-testing']
 * ```
 */
export function getTopSkillsByBM25(
  query: string,
  skillNames: string[],
  index: BM25Index,
  topN: number = 3,
  config: BM25Config = {},
): string[] {
  const ranked = rankSkillsByBM25(query, skillNames, index, config);
  return ranked.slice(0, topN).map(([name]) => name);
}
