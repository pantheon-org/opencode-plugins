/**
 * Tests for BM25 ranking implementation
 */

import { describe, it, expect } from 'bun:test';

import { buildBM25Index, calculateBM25Score, rankSkillsByBM25, getTopSkillsByBM25 } from './bm25';

describe('BM25 Implementation', () => {
  // Sample skills for testing
  const sampleSkills = new Map<string, string>([
    [
      'typescript-tdd',
      'TypeScript development with TDD. Test-driven development using Bun testing framework. Write tests first, then implement functionality.',
    ],
    [
      'plain-english',
      'Writing technical content in plain English for non-technical stakeholders. Avoid jargon, use simple language, explain acronyms.',
    ],
    [
      'react-patterns',
      'Modern React component patterns. Hooks, composition, custom hooks, context API. Best practices for React development.',
    ],
  ]);

  describe('buildBM25Index', () => {
    it('should build index with correct document count', () => {
      const index = buildBM25Index(sampleSkills);

      expect(index.totalDocs).toBe(3);
      expect(index.documents).toHaveLength(3);
    });

    it('should tokenize skill content correctly', () => {
      const index = buildBM25Index(sampleSkills);

      // Each document should have tokens
      for (const doc of index.documents) {
        expect(doc.length).toBeGreaterThan(0);
      }
    });

    it('should calculate average document length', () => {
      const index = buildBM25Index(sampleSkills);

      expect(index.avgDocLength).toBeGreaterThan(0);
      expect(typeof index.avgDocLength).toBe('number');
    });

    it('should build IDF cache', () => {
      const index = buildBM25Index(sampleSkills);

      expect(index.idfCache.size).toBeGreaterThan(0);
    });

    it('should include skill names in tokenization', () => {
      const index = buildBM25Index(sampleSkills);

      // Skill names should be in the documents
      const allTokens = index.documents.flat();
      expect(allTokens).toContain('typescript-tdd');
      expect(allTokens).toContain('plain-english');
      expect(allTokens).toContain('react-patterns');
    });

    it('should handle empty skills map', () => {
      const emptySkills = new Map<string, string>();
      const index = buildBM25Index(emptySkills);

      expect(index.totalDocs).toBe(0);
      expect(index.documents).toHaveLength(0);
    });
  });

  describe('calculateBM25Score', () => {
    // Build index once for all tests
    const index = buildBM25Index(sampleSkills);

    it('should return higher score for exact skill name match', () => {
      const score = calculateBM25Score('typescript-tdd', 0, index);

      expect(score).toBeGreaterThan(0);
    });

    it('should return higher score for relevant content', () => {
      const query = 'I need help with test-driven development and writing tests';
      const tddScore = calculateBM25Score(query, 0, index); // typescript-tdd
      const plainEnglishScore = calculateBM25Score(query, 1, index); // plain-english

      // TDD skill should score higher for this query
      expect(tddScore).toBeGreaterThan(plainEnglishScore);
    });

    it('should return lower score for unrelated content', () => {
      const query = 'explain acronyms to business stakeholders';
      const plainEnglishScore = calculateBM25Score(query, 1, index); // plain-english
      const tddScore = calculateBM25Score(query, 0, index); // typescript-tdd

      // Plain English skill should score higher for this query
      expect(plainEnglishScore).toBeGreaterThan(tddScore);
    });

    it('should handle queries with no matching terms', () => {
      const query = 'xyz123nonexistent';
      const score = calculateBM25Score(query, 0, index);

      expect(score).toBe(0);
    });

    it('should be case-insensitive', () => {
      const query1 = 'TypeScript TDD';
      const query2 = 'typescript tdd';

      const score1 = calculateBM25Score(query1, 0, index);
      const score2 = calculateBM25Score(query2, 0, index);

      expect(score1).toBe(score2);
    });

    it('should respect k1 parameter', () => {
      const query = 'typescript testing development';

      const score1 = calculateBM25Score(query, 0, index, { k1: 1.2 });
      const score2 = calculateBM25Score(query, 0, index, { k1: 2.0 });

      // Different k1 values should produce different scores
      expect(score1).not.toBe(score2);
    });

    it('should respect b parameter', () => {
      const query = 'typescript testing';

      const score1 = calculateBM25Score(query, 0, index, { b: 0.5 });
      const score2 = calculateBM25Score(query, 0, index, { b: 0.9 });

      // Different b values should produce different scores
      expect(score1).not.toBe(score2);
    });
  });

  describe('rankSkillsByBM25', () => {
    const skillNames = ['typescript-tdd', 'plain-english', 'react-patterns'];

    const index = buildBM25Index(sampleSkills);

    it('should rank skills by relevance', () => {
      const query = 'help me with test-driven development using TypeScript';
      const ranked = rankSkillsByBM25(query, skillNames, index);

      // typescript-tdd should be most relevant
      expect(ranked[0][0]).toBe('typescript-tdd');
      expect(ranked[0][1]).toBeGreaterThan(0);
    });

    it('should return all skills sorted by score', () => {
      const query = 'development patterns testing';
      const ranked = rankSkillsByBM25(query, skillNames, index);

      expect(ranked).toHaveLength(3);

      // Scores should be in descending order
      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i][1]).toBeGreaterThanOrEqual(ranked[i + 1][1]);
      }
    });

    it('should filter by threshold', () => {
      const query = 'xyz123nonexistent';
      const ranked = rankSkillsByBM25(query, skillNames, index, { threshold: 1.0 });

      // No skills should meet threshold for nonsense query
      expect(ranked).toHaveLength(0);
    });

    it('should include scores in results', () => {
      const query = 'react hooks components';
      const ranked = rankSkillsByBM25(query, skillNames, index);

      for (const [name, score] of ranked) {
        expect(typeof name).toBe('string');
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle empty query', () => {
      const ranked = rankSkillsByBM25('', skillNames, index);

      // Empty query should return all skills with 0 score (or filtered by threshold)
      expect(ranked).toBeDefined();
    });

    it('should rank React skill higher for React query', () => {
      const query = 'show me react hooks and component patterns';
      const ranked = rankSkillsByBM25(query, skillNames, index);

      // react-patterns should be most relevant
      expect(ranked[0][0]).toBe('react-patterns');
    });
  });

  describe('getTopSkillsByBM25', () => {
    const skillNames = ['typescript-tdd', 'plain-english', 'react-patterns'];

    const index = buildBM25Index(sampleSkills);

    it('should return top N skills', () => {
      const query = 'help with typescript testing and react components';
      const topSkills = getTopSkillsByBM25(query, skillNames, index, 2);

      expect(topSkills).toHaveLength(2);
    });

    it('should return skills in order of relevance', () => {
      const query = 'test-driven development with bun';
      const topSkills = getTopSkillsByBM25(query, skillNames, index, 3);

      // typescript-tdd should be first
      expect(topSkills[0]).toBe('typescript-tdd');
    });

    it('should default to top 3 skills', () => {
      const query = 'development';
      const topSkills = getTopSkillsByBM25(query, skillNames, index);

      expect(topSkills.length).toBeLessThanOrEqual(3);
    });

    it('should respect threshold in config', () => {
      const query = 'xyz nonexistent terms';
      const topSkills = getTopSkillsByBM25(query, skillNames, index, 3, { threshold: 5.0 });

      // High threshold should filter out irrelevant matches
      expect(topSkills.length).toBe(0);
    });

    it('should handle topN larger than available skills', () => {
      const query = 'typescript';
      const topSkills = getTopSkillsByBM25(query, skillNames, index, 100);

      expect(topSkills.length).toBeLessThanOrEqual(skillNames.length);
    });

    it('should return only skill names, not scores', () => {
      const query = 'react patterns';
      const topSkills = getTopSkillsByBM25(query, skillNames, index, 2);

      for (const skill of topSkills) {
        expect(typeof skill).toBe('string');
        expect(skillNames).toContain(skill);
      }
    });
  });

  describe('Real-world scenarios', () => {
    const skillNames = ['typescript-tdd', 'plain-english', 'react-patterns'];

    const index = buildBM25Index(sampleSkills);

    it('should rank correctly for "write tests for React components"', () => {
      const query = 'write tests for React components';
      const ranked = rankSkillsByBM25(query, skillNames, index);

      // Both typescript-tdd and react-patterns should be relevant
      const topTwo = ranked.slice(0, 2).map(([name]) => name);
      expect(topTwo).toContain('typescript-tdd');
      expect(topTwo).toContain('react-patterns');
    });

    it('should rank correctly for "explain this code to executives"', () => {
      const query = 'explain this code to executives and business stakeholders';
      const topSkills = getTopSkillsByBM25(query, skillNames, index, 1);

      // plain-english should be most relevant
      expect(topSkills[0]).toBe('plain-english');
    });

    it('should rank correctly for "typescript tdd approach"', () => {
      const query = 'use typescript tdd approach for development';
      const topSkills = getTopSkillsByBM25(query, skillNames, index, 1);

      expect(topSkills[0]).toBe('typescript-tdd');
    });

    it('should handle multi-skill queries', () => {
      const query = 'write React components using TDD and explain to stakeholders in plain English';
      const ranked = rankSkillsByBM25(query, skillNames, index);

      // All three skills should be somewhat relevant
      expect(ranked).toHaveLength(3);
      expect(ranked.every(([, score]) => score > 0)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle skills with identical content', () => {
      const duplicateSkills = new Map<string, string>([
        ['skill-a', 'same content'],
        ['skill-b', 'same content'],
      ]);

      const index = buildBM25Index(duplicateSkills);
      const ranked = rankSkillsByBM25('same content', ['skill-a', 'skill-b'], index);

      // Both should have identical scores
      expect(ranked[0][1]).toBe(ranked[1][1]);
    });

    it('should handle single skill', () => {
      const singleSkill = new Map<string, string>([['only-skill', 'unique content here']]);

      const index = buildBM25Index(singleSkill);
      const ranked = rankSkillsByBM25('unique content', ['only-skill'], index);

      expect(ranked).toHaveLength(1);
      expect(ranked[0][0]).toBe('only-skill');
    });

    it('should handle very long documents', () => {
      const longContent = 'word '.repeat(1000) + 'unique';
      const longSkills = new Map<string, string>([
        ['long-skill', longContent],
        ['short-skill', 'short content'],
      ]);

      const index = buildBM25Index(longSkills);
      const score = calculateBM25Score('unique', 0, index);

      expect(score).toBeGreaterThan(0);
    });

    it('should handle special characters in queries', () => {
      const index = buildBM25Index(sampleSkills);
      const query = 'typescript-tdd & react@patterns (development)';
      const ranked = rankSkillsByBM25(query, ['typescript-tdd', 'plain-english', 'react-patterns'], index);

      expect(ranked.length).toBeGreaterThan(0);
    });
  });
});
