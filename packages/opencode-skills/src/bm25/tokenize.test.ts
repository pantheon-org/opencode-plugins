/**
 * Tokenize Tests
 *
 * Tests for text tokenization functionality.
 */

import { describe, expect, it } from 'bun:test';
import { tokenize } from './tokenize';

describe('tokenize', () => {
  it('should convert text to lowercase', () => {
    const result = tokenize('Hello World');
    expect(result).toEqual(['hello', 'world']);
  });

  it('should remove punctuation except hyphens', () => {
    const result = tokenize('Hello, World! How are you?');
    expect(result).toEqual(['hello', 'world', 'how', 'are', 'you']);
  });

  it('should preserve hyphens in skill names', () => {
    const result = tokenize('typescript-tdd skill-name');
    expect(result).toEqual(['typescript-tdd', 'skill-name']);
  });

  it('should handle multiple spaces', () => {
    const result = tokenize('Hello    World');
    expect(result).toEqual(['hello', 'world']);
  });

  it('should handle empty string', () => {
    const result = tokenize('');
    expect(result).toEqual([]);
  });

  it('should handle string with only punctuation', () => {
    const result = tokenize('!!!???...');
    expect(result).toEqual([]);
  });

  it('should handle numbers', () => {
    const result = tokenize('Version 1.2.3');
    expect(result).toEqual(['version', '1', '2', '3']);
  });

  it('should handle camelCase', () => {
    const result = tokenize('camelCaseText');
    expect(result).toEqual(['camelcasetext']);
  });
});
