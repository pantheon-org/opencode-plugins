/**
 * Build BM25 Index Tests
 *
 * Tests for BM25 index construction and precomputation.
 */

import { describe, expect, it } from 'bun:test';
import { buildBM25Index } from './build-index';

describe('buildBM25Index', () => {
  it('should build index from skills map', () => {
    const skills = new Map([
      ['skill-one', 'Content for skill one'],
      ['skill-two', 'Content for skill two'],
    ]);
    const index = buildBM25Index(skills);
    expect(index.documents).toHaveLength(2);
    expect(index.totalDocs).toBe(2);
  });

  it('should include skill name in document', () => {
    const skills = new Map([['typescript-tdd', 'TypeScript development']]);
    const index = buildBM25Index(skills);
    const doc = index.documents[0];
    expect(doc).toContain('typescript-tdd');
    expect(doc).toContain('typescript');
    expect(doc).toContain('development');
  });

  it('should calculate average document length', () => {
    const skills = new Map([
      ['short', 'Short content'],
      ['long', 'This is a much longer content with many words for testing'],
    ]);
    const index = buildBM25Index(skills);
    expect(index.avgDocLength).toBeGreaterThan(0);
    // Note: skill name is included in document, so word counts are different
    // 'short' + 'short' + 'content' = 3 words
    // 'long' + 'this' + 'is' + 'a' + 'much' + 'longer' + 'content' + 'with' + 'many' + 'words' + 'for' + 'testing' = 12 words
    // Average = (3 + 12) / 2 = 7.5
    expect(index.avgDocLength).toBeCloseTo(7.5, 1);
  });

  it('should build IDF cache for all terms', () => {
    const skills = new Map([
      ['skill-a', 'common unique'],
      ['skill-b', 'common rare'],
    ]);
    const index = buildBM25Index(skills);
    // Should have cached IDF for: skill-a, skill-b, common, unique, rare
    expect(index.idfCache.size).toBeGreaterThan(0);
    expect(index.idfCache.has('common')).toBe(true);
    expect(index.idfCache.has('unique')).toBe(true);
  });

  it('should handle empty skills map', () => {
    const skills = new Map<string, string>();
    // Currently returns NaN for avgDocLength when empty, doesn't throw
    const index = buildBM25Index(skills);
    expect(index.documents).toHaveLength(0);
    expect(index.totalDocs).toBe(0);
    expect(Number.isNaN(index.avgDocLength)).toBe(true);
  });

  it('should handle skills with same content', () => {
    const skills = new Map([
      ['skill-a', 'Same content'],
      ['skill-b', 'Same content'],
    ]);
    const index = buildBM25Index(skills);
    expect(index.documents).toHaveLength(2);
    // IDF for 'content' should be low since it appears in all docs
    const contentIdf = index.idfCache.get('content');
    expect(contentIdf).toBeLessThan(Math.log(2)); // Less than max possible IDF
  });

  it('should handle skills with no overlap', () => {
    const skills = new Map([
      ['skill-a', 'Alpha Beta Gamma'],
      ['skill-b', 'Delta Epsilon Zeta'],
    ]);
    const index = buildBM25Index(skills);
    expect(index.totalDocs).toBe(2);
    // No shared terms except skill names
    expect(index.idfCache.size).toBe(8); // 2 skill names + 6 content words
  });
});
