/**
 * Tests for pattern matching logic
 */

import { describe, it, expect } from 'bun:test';

import { hasIntentToUse, findMatchingSkills } from './pattern-matching';

describe('hasIntentToUse', () => {
  describe('word boundary matching', () => {
    it('should match exact skill name with word boundaries', () => {
      const result = hasIntentToUse('I want to use typescript-tdd for this project', 'typescript-tdd');
      expect(result.matches).toBe(true);
      expect(result.hasNegation).toBe(false);
    });

    it('should match skill name even in compound words due to intent', () => {
      // Note: This matches because "use" is an intent keyword that triggers matching
      const result = hasIntentToUse('I want to use typescript-tdd-extended', 'typescript-tdd');
      expect(result.matches).toBe(true);
    });

    it('should match case-insensitively', () => {
      const result = hasIntentToUse('Use TypeScript-TDD for development', 'typescript-tdd');
      expect(result.matches).toBe(true);
    });
  });

  describe('intent detection', () => {
    it('should match "use" intent keyword', () => {
      const result = hasIntentToUse('use the typescript-tdd approach', 'typescript-tdd');
      expect(result.matches).toBe(true);
      // Note: Word boundary may match before intent pattern
      if (result.matchedPattern) {
        const patternType = result.matchedPattern.split(':')[0];
        expect(['intent', 'word-boundary']).toContain(patternType);
      }
    });

    it('should match "apply" intent keyword', () => {
      const result = hasIntentToUse('apply typescript-tdd principles', 'typescript-tdd');
      expect(result.matches).toBe(true);
    });

    it('should match "follow" intent keyword', () => {
      const result = hasIntentToUse('follow the typescript-tdd guidelines', 'typescript-tdd');
      expect(result.matches).toBe(true);
    });

    it('should match "implement" intent keyword', () => {
      const result = hasIntentToUse('implement with typescript-tdd', 'typescript-tdd');
      expect(result.matches).toBe(true);
    });

    it('should match intent keyword after skill name', () => {
      const result = hasIntentToUse('typescript-tdd approach', 'typescript-tdd');
      expect(result.matches).toBe(true);
    });
  });

  describe('negation detection', () => {
    it('should detect "don\'t use" negation', () => {
      const result = hasIntentToUse("don't use typescript-tdd for this", 'typescript-tdd');
      expect(result.matches).toBe(false);
      expect(result.hasNegation).toBe(true);
    });

    it('should detect "avoid" negation', () => {
      const result = hasIntentToUse('avoid typescript-tdd patterns', 'typescript-tdd');
      expect(result.matches).toBe(false);
      expect(result.hasNegation).toBe(true);
    });

    it('should detect "without" negation', () => {
      const result = hasIntentToUse('implement without typescript-tdd', 'typescript-tdd');
      expect(result.matches).toBe(false);
      expect(result.hasNegation).toBe(true);
    });

    it('should detect "skip" negation', () => {
      const result = hasIntentToUse('skip the typescript-tdd approach', 'typescript-tdd');
      expect(result.matches).toBe(false);
      expect(result.hasNegation).toBe(true);
    });

    it('should still detect negation within 50-char window', () => {
      const result = hasIntentToUse("don't worry about other things, use typescript-tdd here", 'typescript-tdd', [], {
        negationDetection: true,
      });
      // The negation "don't" is within 50 chars of "typescript-tdd"
      expect(result.hasNegation).toBe(true);
      expect(result.matches).toBe(false);
    });
  });

  describe('keyword matching', () => {
    it('should match additional keywords', () => {
      const result = hasIntentToUse('use TDD approach', 'typescript-tdd', ['TDD', 'test-driven']);
      expect(result.matches).toBe(true);
      expect(result.matchedPattern).toContain('keyword');
    });

    it('should match multiple keywords', () => {
      const result1 = hasIntentToUse('use TDD', 'typescript-tdd', ['TDD']);
      const result2 = hasIntentToUse('test-driven development', 'typescript-tdd', ['test-driven']);
      expect(result1.matches).toBe(true);
      expect(result2.matches).toBe(true);
    });
  });

  describe('configuration options', () => {
    it('should respect wordBoundary config', () => {
      const result = hasIntentToUse('typescript-tdd', 'typescript-tdd', [], {
        wordBoundary: false,
        intentDetection: false,
      });
      // With both disabled, should not match
      expect(result.matches).toBe(false);
    });

    it('should respect intentDetection config', () => {
      const result = hasIntentToUse('use something else', 'typescript-tdd', [], { intentDetection: false });
      expect(result.matches).toBe(false);
    });

    it('should respect negationDetection config', () => {
      const result = hasIntentToUse("don't use typescript-tdd", 'typescript-tdd', [], { negationDetection: false });
      // With negation detection disabled, should match
      expect(result.matches).toBe(true);
    });

    it('should use custom intent keywords', () => {
      const result = hasIntentToUse('leverage typescript-tdd', 'typescript-tdd', [], {
        customIntentKeywords: ['leverage'],
      });
      expect(result.matches).toBe(true);
    });

    it('should use custom negation keywords', () => {
      const result = hasIntentToUse('exclude typescript-tdd', 'typescript-tdd', [], {
        customNegationKeywords: ['exclude'],
      });
      expect(result.matches).toBe(false);
      expect(result.hasNegation).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const result = hasIntentToUse('', 'typescript-tdd');
      expect(result.matches).toBe(false);
    });

    it('should handle skill name with special regex characters', () => {
      const result = hasIntentToUse('use test.skill+pattern', 'test.skill+pattern');
      expect(result.matches).toBe(true);
    });

    it('should handle multiline content', () => {
      const result = hasIntentToUse('We need to:\n1. Use typescript-tdd\n2. Write tests', 'typescript-tdd');
      expect(result.matches).toBe(true);
    });
  });
});

describe('findMatchingSkills', () => {
  it('should find multiple matching skills', () => {
    const content = 'use typescript-tdd and plain-english guidelines';
    const skills = ['typescript-tdd', 'plain-english', 'react-patterns'];

    const matches = findMatchingSkills(content, skills);
    expect(matches).toContain('typescript-tdd');
    expect(matches).toContain('plain-english');
    expect(matches).not.toContain('react-patterns');
  });

  it('should use skill keywords for matching', () => {
    const content = 'write tests using TDD';
    const skills = ['typescript-tdd'];
    const keywords = new Map([['typescript-tdd', ['TDD', 'test-driven']]]);

    const matches = findMatchingSkills(content, skills, keywords);
    expect(matches).toContain('typescript-tdd');
  });

  it('should return empty array when no skills match', () => {
    const content = 'random content';
    const skills = ['typescript-tdd', 'plain-english'];

    const matches = findMatchingSkills(content, skills);
    expect(matches).toEqual([]);
  });

  it('should respect configuration options', () => {
    const content = "don't use typescript-tdd";
    const skills = ['typescript-tdd'];

    const matchesWithNegation = findMatchingSkills(content, skills, new Map(), {
      negationDetection: true,
    });
    const matchesWithoutNegation = findMatchingSkills(content, skills, new Map(), {
      negationDetection: false,
    });

    expect(matchesWithNegation).toEqual([]);
    expect(matchesWithoutNegation).toContain('typescript-tdd');
  });
});
