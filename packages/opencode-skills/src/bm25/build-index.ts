/**
 * Build BM25 Index
 *
 * Precompute document statistics and IDF values for efficient BM25 scoring.
 */

import { inverseDocumentFrequency } from './inverse-document-frequency';
import { tokenize } from './tokenize';
import type { BM25Index } from './types';

/**
 * Build BM25 index from skill content
 *
 * @param skills - Map of skill name to skill content
 * @returns Precomputed BM25 index with tokenized documents and IDF cache
 *
 * @example
 * ```typescript
 * const skills = new Map([
 *   ['typescript-tdd', 'TypeScript development with test-driven development'],
 *   ['bun-runtime', 'Bun runtime for fast JavaScript execution'],
 * ]);
 *
 * const index = buildBM25Index(skills);
 * console.log(index.totalDocs); // => 2
 * ```
 */
export function buildBM25Index(skills: Map<string, string>): BM25Index {
  const documents: string[][] = [];
  const skillNames: string[] = [];

  // Tokenize all skill content
  for (const [name, content] of skills.entries()) {
    // Combine skill name, description, and content for indexing
    const combinedText = `${name} ${content}`;
    documents.push(tokenize(combinedText));
    skillNames.push(name);
  }

  // Calculate average document length
  const totalLength = documents.reduce((sum, doc) => sum + doc.length, 0);
  const avgDocLength = totalLength / documents.length;

  // Precompute IDF for all unique terms
  const allTerms = new Set<string>();
  for (const doc of documents) {
    for (const term of doc) {
      allTerms.add(term);
    }
  }

  const idfCache = new Map<string, number>();
  for (const term of allTerms) {
    idfCache.set(term, inverseDocumentFrequency(term, documents, documents.length));
  }

  return {
    documents,
    avgDocLength,
    totalDocs: documents.length,
    idfCache,
  };
}
