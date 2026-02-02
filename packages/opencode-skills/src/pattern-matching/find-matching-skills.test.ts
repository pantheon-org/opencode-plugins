/**
 * Find Matching Skills Tests
 *
 * Tests for batch skill matching with edge cases.
 */

import { describe, expect, it } from 'bun:test';
import { findMatchingSkills } from './find-matching-skills';

describe('findMatchingSkills', () => {
  it('should find matching skill from array', () => {
    const skills = ['typescript-tdd', 'react-hooks', 'node-api'];
    const result = findMatchingSkills('Use typescript-tdd', skills);
    expect(result).toEqual(['typescript-tdd']);
  });

  it('should return empty array when no matches', () => {
    const skills = ['typescript-tdd', 'react-hooks'];
    const result = findMatchingSkills('Use python-flask', skills);
    expect(result).toEqual([]);
  });

  it('should find multiple matching skills', () => {
    const skills = ['typescript-tdd', 'react-hooks', 'node-api'];
    const result = findMatchingSkills('Use typescript-tdd and react-hooks', skills);
    expect(result).toEqual(['typescript-tdd', 'react-hooks']);
  });

  it('should handle empty skills array', () => {
    const result = findMatchingSkills('Use typescript-tdd', []);
    expect(result).toEqual([]);
  });

  it('should handle empty content', () => {
    const skills = ['typescript-tdd', 'react-hooks'];
    const result = findMatchingSkills('', skills);
    expect(result).toEqual([]);
  });

  it('should use custom keywords map', () => {
    const skills = ['typescript-tdd', 'react-hooks'];
    const keywords = new Map([
      ['typescript-tdd', ['tdd', 'test-driven']],
      ['react-hooks', ['hooks', 'react']],
    ]);
    const result = findMatchingSkills('Use TDD approach', skills, keywords);
    expect(result).toEqual(['typescript-tdd']);
  });

  it('should handle skills without keywords in map', () => {
    const skills = ['typescript-tdd', 'react-hooks'];
    const keywords = new Map([['typescript-tdd', ['tdd']]]);
    const result = findMatchingSkills('Use react-hooks', skills, keywords);
    expect(result).toEqual(['react-hooks']);
  });

  it('should handle special characters in content', () => {
    const skills = ['regex.utils', 'file[test]'];
    const result = findMatchingSkills('Use regex.utils pattern', skills);
    expect(result).toEqual(['regex.utils']);
  });

  it('should handle large skills array', () => {
    const skills = Array.from({ length: 100 }, (_, i) => `skill-${i}`);
    const result = findMatchingSkills('Use skill-50', skills);
    expect(result).toEqual(['skill-50']);
  });

  it('should maintain order of matches', () => {
    const skills = ['typescript-tdd', 'react-hooks', 'node-api'];
    const result = findMatchingSkills('Use node-api with typescript-tdd', skills);
    expect(result).toEqual(['typescript-tdd', 'node-api']);
  });

  it('should not match skills in negated phrases', () => {
    const skills = ['typescript-tdd', 'react-hooks'];
    // With negation detection enabled, neither skill matches due to negation
    const result = findMatchingSkills("Don't use typescript-tdd or react-hooks", skills);
    expect(result).toEqual([]);
  });

  it('should handle mixed case skill names', () => {
    const skills = ['TypeScript-TDD', 'React-Hooks'];
    const result = findMatchingSkills('Use typescript-tdd', skills);
    expect(result).toEqual(['TypeScript-TDD']);
  });

  it('should handle config options', () => {
    const skills = ['typescript-tdd', 'react-hooks'];
    const result = findMatchingSkills('Use typescript-tdd', skills, new Map(), {
      wordBoundary: true,
      intentDetection: true,
      negationDetection: true,
    });
    expect(result).toEqual(['typescript-tdd']);
  });

  it('should handle very long content', () => {
    const skills = ['typescript-tdd'];
    const longContent = 'Use typescript-tdd'.repeat(1000);
    const result = findMatchingSkills(longContent, skills);
    expect(result).toEqual(['typescript-tdd']);
  });
});
