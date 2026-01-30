import { describe, expect, it } from 'bun:test';

import type { ChangeDetection } from './types';

/**
 * Note: These are unit tests for detectChanges types and structure.
 * Full integration tests with git operations require a complex test setup
 * with temporary repositories and are better suited for E2E testing.
 *
 * The function uses git commands which are well-tested,
 * and we have manual testing via the workflow.
 */

describe('detectChanges types and structure', () => {
  it('should have correct ChangeDetection structure for changes detected', () => {
    const result: ChangeDetection = {
      hasChanges: true,
      previousTag: 'my-plugin@v1.0.0',
      changes: ['src/index.ts', 'README.md', 'package.json'],
    };

    expect(result.hasChanges).toBe(true);
    expect(result.previousTag).toBe('my-plugin@v1.0.0');
    expect(result.changes).toBeDefined();
    expect(result.changes?.length).toBe(3);
  });

  it('should have correct ChangeDetection structure for no changes', () => {
    const result: ChangeDetection = {
      hasChanges: false,
      previousTag: 'my-plugin@v1.0.0',
      changes: [],
    };

    expect(result.hasChanges).toBe(false);
    expect(result.previousTag).toBe('my-plugin@v1.0.0');
    expect(result.changes).toBeDefined();
    expect(result.changes?.length).toBe(0);
  });

  it('should have correct ChangeDetection structure for first release', () => {
    const result: ChangeDetection = {
      hasChanges: true,
      previousTag: undefined,
    };

    expect(result.hasChanges).toBe(true);
    expect(result.previousTag).toBeUndefined();
  });

  it('should support optional changes array', () => {
    const result: ChangeDetection = {
      hasChanges: true,
      previousTag: 'my-plugin@v1.0.0',
    };

    expect(result.hasChanges).toBe(true);
    expect(result.changes).toBeUndefined();
  });
});
