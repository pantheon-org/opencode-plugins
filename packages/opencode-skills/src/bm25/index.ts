/**
 * BM25 (Best Matching 25) Probabilistic Ranking Function
 *
 * BM25 is a bag-of-words retrieval function that ranks documents based on
 * term frequency, inverse document frequency, and document length normalization.
 *
 * This module provides efficient BM25 scoring for skill relevance ranking.
 *
 * @see https://en.wikipedia.org/wiki/Okapi_BM25
 */

// Core functions
export { buildBM25Index } from './build-index';
export { calculateBM25Score } from './calculate-score';
export { getTopSkillsByBM25 } from './get-top-skills';
// Utility functions
export { inverseDocumentFrequency } from './inverse-document-frequency';
export { rankSkillsByBM25 } from './rank-skills';
export { termFrequency } from './term-frequency';
export { tokenize } from './tokenize';

// Type definitions
export type { BM25Config, BM25Index } from './types';
export { DEFAULT_BM25_CONFIG } from './types';
