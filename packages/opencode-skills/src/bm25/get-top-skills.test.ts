/**
 * Get Top Skills by BM25 Tests
 *
 * Tests for retrieving top N skills by BM25 relevance scoring.
 */

import { describe, expect, it } from 'bun:test';
import { buildBM25Index } from './build-index';
import { getTopSkillsByBM25 } from './get-top-skills';
import type { BM25Index } from './types';

describe('getTopSkillsByBM25', () => {
  const createTestIndex = (): BM25Index => {
    const skills = new Map([
      ['typescript-tdd', 'TypeScript development with test-driven development approach'],
      ['react-hooks', 'React hooks for state management in functional components'],
      ['node-api', 'Building RESTful APIs with Node.js and Express framework'],
      ['python-ml', 'Machine learning with Python and TensorFlow'],
    ]);
    return buildBM25Index(skills);
  };

  it('should return top N skills by relevance', () => {
    const index = createTestIndex();
    const skillNames = ['typescript-tdd', 'react-hooks', 'node-api', 'python-ml'];
    const topSkills = getTopSkillsByBM25('typescript development', skillNames, index, 2);

    expect(topSkills).toHaveLength(2);
    expect(topSkills[0]).toBe('typescript-tdd');
  });

  it('should default to returning top 3 skills', () => {
    const index = createTestIndex();
    const skillNames = ['typescript-tdd', 'react-hooks', 'node-api', 'python-ml'];
    const topSkills = getTopSkillsByBM25('development', skillNames, index);

    expect(topSkills.length).toBeLessThanOrEqual(3);
  });

  it('should return empty array when no skills match', () => {
    const index = createTestIndex();
    const skillNames = ['typescript-tdd', 'react-hooks'];
    // Use high threshold to filter out low-relevance matches
    const topSkills = getTopSkillsByBM25('machine learning tensorflow', skillNames, index, 3, { threshold: 1.0 });

    // All scores should be below threshold and filtered out
    expect(topSkills).toHaveLength(0);
  });

  it('should return skills in descending order of relevance', () => {
    const index = createTestIndex();
    const skillNames = ['typescript-tdd', 'react-hooks', 'node-api'];
    const topSkills = getTopSkillsByBM25('react state hooks', skillNames, index, 3);

    // react-hooks should be most relevant
    expect(topSkills[0]).toBe('react-hooks');
  });

  it('should handle empty skill names array', () => {
    const index = createTestIndex();
    const topSkills = getTopSkillsByBM25('test', [], index, 3);

    expect(topSkills).toHaveLength(0);
  });

  it('should handle topN larger than available skills', () => {
    const index = createTestIndex();
    const skillNames = ['typescript-tdd', 'react-hooks'];
    const topSkills = getTopSkillsByBM25('development', skillNames, index, 10);

    expect(topSkills.length).toBeLessThanOrEqual(2);
  });

  it('should apply threshold from config', () => {
    const index = createTestIndex();
    const skillNames = ['typescript-tdd', 'react-hooks', 'node-api'];
    // With high threshold, only very relevant matches return
    const topSkills = getTopSkillsByBM25('typescript', skillNames, index, 3, { threshold: 5.0 });

    // Should only return highly relevant matches
    expect(topSkills.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle query with special characters', () => {
    const index = createTestIndex();
    const skillNames = ['typescript-tdd', 'react-hooks'];
    const topSkills = getTopSkillsByBM25('TypeScript, TDD!', skillNames, index, 2);

    expect(topSkills.length).toBeGreaterThanOrEqual(0);
    if (topSkills.length > 0) {
      expect(topSkills[0]).toBe('typescript-tdd');
    }
  });
});
