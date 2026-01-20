/**
 * Tests for isFailure type guard
 */

import { failure } from './failure';
import { isFailure } from './is-failure';
import { success } from './success';

describe('isFailure', () => {
  it('should return true for failure response', () => {
    const response = failure('Error occurred');

    expect(isFailure(response)).toBe(true);
  });

  it('should return false for success response', () => {
    const response = success({ data: 'test' });

    expect(isFailure(response)).toBe(false);
  });

  it('should narrow type for failure response', () => {
    const response = failure('Test error', {
      code: 'TEST_ERROR',
      context: { detail: 'info' },
    });

    if (isFailure(response)) {
      // TypeScript should know response.error exists
      expect(response.error).toBeDefined();
      expect(response.error.message).toBe('Test error');
      expect(response.error.code).toBe('TEST_ERROR');
      expect(response.error.context).toEqual({ detail: 'info' });
    }
  });

  it('should work with different error configurations', () => {
    const simpleError = failure('Simple error');
    const errorWithCode = failure('Error', { code: 'ERR_CODE' });
    const errorWithContext = failure('Error', {
      context: { info: 'details' },
    });

    expect(isFailure(simpleError)).toBe(true);
    expect(isFailure(errorWithCode)).toBe(true);
    expect(isFailure(errorWithContext)).toBe(true);
  });

  it('should return false when success is false but error is undefined', () => {
    const response = {
      success: false,
      metadata: { timestamp: Date.now() },
    };

    expect(isFailure(response as any)).toBe(false);
  });
});
