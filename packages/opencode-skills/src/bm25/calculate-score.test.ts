/**
 * Calculate BM25 Score Tests
 *
 * Tests for BM25 relevance scoring algorithm.
 */

import { describe, expect, it } from 'bun:test';
import { buildBM25Index } from './build-index';
import { calculateBM25Score } from './calculate-score';
import type { BM25Index } from './types';

describe('calculateBM25Score', () => {
  const createTestIndex = (): BM25Index => {
    const skills = new Map([
      ['typescript-tdd', 'TypeScript development with test-driven development approach'],
      ['react-hooks', 'React hooks for state management in functional components'],
      ['node-api', 'Building RESTful APIs with Node.js and Express framework'],
    ]);
    return buildBM25Index(skills);
  };

  it('should return positive score for matching query', () => {
    const index = createTestIndex();
    const score = calculateBM25Score('typescript development', 0, index);
    expect(score).toBeGreaterThan(0);
  });

  it('should return 0 for non-matching query', () => {
    const index = createTestIndex();
    const score = calculateBM25Score('python machine learning', 0, index);
    expect(score).toBe(0);
  });

  it('should return higher score for better matching document', () => {
    const index = createTestIndex();
    const score0 = calculateBM25Score('react hooks state', 0, index); // typescript-tdd
    const score1 = calculateBM25Score('react hooks state', 1, index); // react-hooks
    expect(score1).toBeGreaterThan(score0);
  });

  it('should return 0 for out of bounds index', () => {
    const index = createTestIndex();
    expect(calculateBM25Score('test', -1, index)).toBe(0);
    expect(calculateBM25Score('test', 100, index)).toBe(0);
  });

  it('should respect custom k1 parameter', () => {
    const index = createTestIndex();
    const scoreLowK1 = calculateBM25Score('typescript', 0, index, { k1: 0.5 });
    const scoreHighK1 = calculateBM25Score('typescript', 0, index, { k1: 2.0 });
    // Higher k1 should allow more term frequency influence
    expect(scoreHighK1).not.toBe(scoreLowK1);
  });

  it('should respect custom b parameter', () => {
    const index = createTestIndex();
    const scoreLowB = calculateBM25Score('typescript development', 0, index, { b: 0.0 });
    const scoreHighB = calculateBM25Score('typescript development', 0, index, { b: 1.0 });
    // Different b values should produce different scores
    expect(scoreLowB).not.toBe(scoreHighB);
  });

  it('should handle multi-term queries', () => {
    const index = createTestIndex();
    const scoreSingle = calculateBM25Score('typescript', 0, index);
    const scoreMultiple = calculateBM25Score('typescript development test', 0, index);
    expect(scoreMultiple).toBeGreaterThan(scoreSingle);
  });

  it('should handle query with special characters', () => {
    const index = createTestIndex();
    const score = calculateBM25Score('TypeScript, Development!', 0, index);
    expect(score).toBeGreaterThan(0);
  });
});
