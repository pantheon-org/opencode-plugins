/**
 * Tests for createSummary
 */

import { createSummary } from './create-summary';

describe('createSummary', () => {
  it('should create summary from counts', () => {
    const counts = { Critical: 2, High: 5, Medium: 10 };
    const summary = createSummary(counts);

    expect(summary).toBe('Critical: 2, High: 5, Medium: 10');
  });

  it('should filter out zero counts', () => {
    const counts = { errors: 3, warnings: 0, info: 5 };
    const summary = createSummary(counts);

    expect(summary).toBe('errors: 3, info: 5');
  });

  it('should use custom separator', () => {
    const counts = { errors: 3, warnings: 7 };
    const summary = createSummary(counts, ' | ');

    expect(summary).toBe('errors: 3 | warnings: 7');
  });

  it('should handle empty object', () => {
    const summary = createSummary({});
    expect(summary).toBe('');
  });

  it('should handle all zero counts', () => {
    const counts = { errors: 0, warnings: 0 };
    const summary = createSummary(counts);

    expect(summary).toBe('');
  });

  it('should maintain order of counts', () => {
    const counts = { Z: 1, A: 2, M: 3 };
    const summary = createSummary(counts);

    expect(summary).toBe('Z: 1, A: 2, M: 3');
  });
});
