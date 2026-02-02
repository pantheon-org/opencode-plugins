/**
 * Calculate BM25 Score
 *
 * Calculate BM25 relevance score for a query against a document using the
 * Best Matching 25 probabilistic ranking function.
 */

import { termFrequency } from './term-frequency';
import { tokenize } from './tokenize';
import type { BM25Config, BM25Index } from './types';
import { DEFAULT_BM25_CONFIG } from './types';

/**
 * Calculate BM25 score for a query against a document
 *
 * Formula: BM25(D, Q) = Σ IDF(qi) * (f(qi, D) * (k1 + 1)) / (f(qi, D) + k1 * (1 - b + b * |D| / avgdl))
 *
 * Where:
 * - D: Document (skill content)
 * - Q: Query (user message)
 * - qi: Query term i
 * - f(qi, D): Term frequency of qi in D
 * - |D|: Document length
 * - avgdl: Average document length
 * - k1: Term frequency saturation parameter (typically 1.2-2.0)
 * - b: Length normalization parameter (typically 0.75)
 * - IDF(qi): Inverse document frequency of qi
 *
 * @param query - User message/query
 * @param docIndex - Document index in the BM25 index
 * @param index - Precomputed BM25 index
 * @param config - BM25 configuration parameters
 * @returns BM25 relevance score
 */
export function calculateBM25Score(query: string, docIndex: number, index: BM25Index, config: BM25Config = {}): number {
  const { k1, b } = { ...DEFAULT_BM25_CONFIG, ...config };

  // Handle out of bounds
  if (docIndex < 0 || docIndex >= index.documents.length) {
    return 0;
  }

  const queryTerms = tokenize(query);
  const document = index.documents[docIndex];
  const docLength = document.length;

  let score = 0;

  for (const term of queryTerms) {
    // Get IDF from cache, default to 0 if term not in corpus
    const idf = index.idfCache.get(term) || 0;

    // Calculate term frequency in document
    const tf = termFrequency(term, document);

    // BM25 formula
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + (b * docLength) / index.avgDocLength);

    score += idf * (numerator / denominator);
  }

  return score;
}
