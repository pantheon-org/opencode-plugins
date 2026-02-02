/**
 * Term Frequency Tests
 *
 * Tests for term frequency calculation in documents.
 */

import { describe, expect, it } from 'bun:test';
import { termFrequency } from './term-frequency';

describe('termFrequency', () => {
  it('should count single occurrence', () => {
    const doc = ['the', 'quick', 'brown', 'fox'];
    expect(termFrequency('quick', doc)).toBe(1);
  });

  it('should count multiple occurrences', () => {
    const doc = ['the', 'quick', 'quick', 'brown', 'fox'];
    expect(termFrequency('quick', doc)).toBe(2);
  });

  it('should return 0 for term not in document', () => {
    const doc = ['the', 'quick', 'brown', 'fox'];
    expect(termFrequency('lazy', doc)).toBe(0);
  });

  it('should handle empty document', () => {
    expect(termFrequency('test', [])).toBe(0);
  });

  it('should be case sensitive', () => {
    const doc = ['Hello', 'hello', 'HELLO'];
    expect(termFrequency('hello', doc)).toBe(1);
    expect(termFrequency('Hello', doc)).toBe(1);
  });

  it('should handle all same terms', () => {
    const doc = ['test', 'test', 'test', 'test'];
    expect(termFrequency('test', doc)).toBe(4);
  });
});
