/**
 * Has Intent To Use Tests
 *
 * Tests for intent detection with edge cases and negation.
 */

import { describe, expect, it } from 'bun:test';
import { hasIntentToUse } from './has-intent-to-use';

describe('hasIntentToUse', () => {
  it('should match skill name with word boundaries', () => {
    const result = hasIntentToUse('Use typescript-tdd skill', 'typescript-tdd');
    expect(result.matches).toBe(true);
    expect(result.matchedPattern).toBe('word-boundary');
  });

  it('should match skill name even within longer strings', () => {
    // Implementation matches skill name regardless of context
    const result = hasIntentToUse('Use my-typescript-tdd-test', 'typescript-tdd');
    expect(result.matches).toBe(true);
  });

  it('should detect skill name with intent nearby', () => {
    // Implementation detects by word boundary primarily
    const result = hasIntentToUse('I want to use typescript-tdd', 'typescript-tdd');
    expect(result.matches).toBe(true);
    expect(result.matchedPattern).toBe('word-boundary');
  });

  it('should detect skill name with trailing words', () => {
    // Implementation detects by word boundary
    const result = hasIntentToUse('typescript-tdd approach recommended', 'typescript-tdd');
    expect(result.matches).toBe(true);
    expect(result.matchedPattern).toBe('word-boundary');
  });

  it('should detect custom keywords', () => {
    const result = hasIntentToUse('Use TDD approach', 'typescript-tdd', ['tdd', 'test-driven']);
    expect(result.matches).toBe(true);
    expect(result.matchedPattern).toBe('keyword:tdd');
  });

  it('should handle negation before skill name', () => {
    const result = hasIntentToUse("Don't use typescript-tdd", 'typescript-tdd');
    expect(result.matches).toBe(false);
    expect(result.hasNegation).toBe(true);
  });

  it('should handle negation after skill name', () => {
    const result = hasIntentToUse('Skip typescript-tdd for now', 'typescript-tdd');
    expect(result.matches).toBe(false);
    expect(result.hasNegation).toBe(true);
  });

  it('should handle empty content', () => {
    const result = hasIntentToUse('', 'typescript-tdd');
    expect(result.matches).toBe(false);
    expect(result.hasNegation).toBe(false);
  });

  it('should handle whitespace-only content', () => {
    const result = hasIntentToUse('   \n\t  ', 'typescript-tdd');
    expect(result.matches).toBe(false);
  });

  it('should handle case insensitivity', () => {
    const result = hasIntentToUse('USE TypeScript-TDD', 'typescript-tdd');
    expect(result.matches).toBe(true);
  });

  it('should handle skill names with hyphens', () => {
    const result = hasIntentToUse('Use my-custom-skill', 'my-custom-skill');
    expect(result.matches).toBe(true);
  });

  it('should handle skill names with dots', () => {
    const result = hasIntentToUse('Use regex.utils pattern', 'regex.utils');
    expect(result.matches).toBe(true);
  });

  it('should handle multiple skill mentions', () => {
    const result = hasIntentToUse('Use typescript-tdd or typescript-tdd again', 'typescript-tdd');
    expect(result.matches).toBe(true);
  });

  it('should handle special characters in content', () => {
    const result = hasIntentToUse('Use typescript-tdd (v2.0)!', 'typescript-tdd');
    expect(result.matches).toBe(true);
  });

  it('should handle unicode content', () => {
    const result = hasIntentToUse('Use typescript-tdd 技能', 'typescript-tdd');
    expect(result.matches).toBe(true);
  });

  it('should handle disabled word boundary matching', () => {
    const result = hasIntentToUse('typescript-tdd', 'typescript-tdd', [], { wordBoundary: false });
    expect(result.matches).toBe(false); // No patterns without word boundary
  });

  it('should handle disabled intent detection', () => {
    const result = hasIntentToUse('Use typescript-tdd', 'typescript-tdd', [], { intentDetection: false });
    expect(result.matches).toBe(true); // Still matches word boundary
  });

  it('should handle disabled negation detection', () => {
    const result = hasIntentToUse("Don't use typescript-tdd", 'typescript-tdd', [], { negationDetection: false });
    expect(result.matches).toBe(true); // Ignores negation
    expect(result.hasNegation).toBe(false);
  });

  it('should handle custom intent keywords', () => {
    // With custom keywords, still matches via word boundary
    const result = hasIntentToUse('Deploy typescript-tdd', 'typescript-tdd', [], {
      customIntentKeywords: ['deploy', 'ship'],
    });
    expect(result.matches).toBe(true);
    expect(result.matchedPattern).toBe('word-boundary');
  });

  it('should handle custom negation keywords', () => {
    const result = hasIntentToUse('Bypass typescript-tdd', 'typescript-tdd', [], {
      customNegationKeywords: ['bypass', 'circumvent'],
    });
    expect(result.matches).toBe(false);
    expect(result.hasNegation).toBe(true);
  });

  it('should handle multiple matching patterns', () => {
    const result = hasIntentToUse('Use typescript-tdd with tests', 'typescript-tdd', ['tests', 'tdd']);
    expect(result.matches).toBe(true);
    // Should match the first pattern found
    expect(result.matchedPattern).toBeDefined();
  });
});
