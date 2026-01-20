/**
 * Tests for isSuccess type guard
 */

import { failure } from './failure';
import { isSuccess } from './is-success';
import { success } from './success';

describe('isSuccess', () => {
  it('should return true for success response', () => {
    const response = success({ data: 'test' });

    expect(isSuccess(response)).toBe(true);
  });

  it('should return false for failure response', () => {
    const response = failure('Error occurred');

    expect(isSuccess(response)).toBe(false);
  });

  it('should narrow type for successful response', () => {
    const response = success({ id: 1, name: 'Test' });

    if (isSuccess(response)) {
      // TypeScript should know response.data exists
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(1);
      expect(response.data.name).toBe('Test');
    }
  });

  it('should work with different data types', () => {
    const stringResponse = success('text');
    const numberResponse = success(42);
    const arrayResponse = success([1, 2, 3]);
    const nullResponse = success(null);

    expect(isSuccess(stringResponse)).toBe(true);
    expect(isSuccess(numberResponse)).toBe(true);
    expect(isSuccess(arrayResponse)).toBe(true);
    expect(isSuccess(nullResponse)).toBe(true);
  });

  it('should return false when success is true but data is undefined', () => {
    const response = {
      success: true,
      metadata: { timestamp: Date.now() },
    };

    expect(isSuccess(response as any)).toBe(false);
  });
});
