/**
 * Tests for retry utility
 */

import { withRetry } from './retry';

describe('withRetry', () => {
  it('should return result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    let attempts = 0;
    const fn = jest.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error(`fail ${attempts}`));
      }
      return Promise.resolve('success');
    });

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  }, 10000); // Increase timeout for actual delays

  it('should throw error after max retries', async () => {
    const error = new Error('persistent failure');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(withRetry(fn, 3)).rejects.toThrow('persistent failure');
    expect(fn).toHaveBeenCalledTimes(3);
  }, 10000); // Increase timeout for actual delays

  it('should not retry on 403 error', async () => {
    const error = Object.assign(new Error('Forbidden'), { status: 403 });
    const fn = jest.fn().mockRejectedValue(error);

    await expect(withRetry(fn)).rejects.toThrow('Forbidden');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should respect custom maxRetries', async () => {
    const error = new Error('fail');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(withRetry(fn, 5)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(5);
  }, 15000); // Increase timeout for actual delays
});
