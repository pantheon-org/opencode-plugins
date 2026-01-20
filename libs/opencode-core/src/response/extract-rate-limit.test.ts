/**
 * Tests for extractRateLimit
 */

import { extractRateLimit } from './extract-rate-limit';

describe('extractRateLimit', () => {
  it('should extract rate limit from headers', () => {
    const headers = new Headers({
      'x-ratelimit-limit': '60',
      'x-ratelimit-remaining': '45',
      'x-ratelimit-reset': '1234567890',
    });

    const rateLimit = extractRateLimit(headers);

    expect(rateLimit).toEqual({
      limit: 60,
      remaining: 45,
      reset: 1234567890,
    });
  });

  it('should return undefined when headers are missing', () => {
    const headers = new Headers();
    const rateLimit = extractRateLimit(headers);

    expect(rateLimit).toBeUndefined();
  });

  it('should return undefined when limit header is missing', () => {
    const headers = new Headers({
      'x-ratelimit-remaining': '45',
      'x-ratelimit-reset': '1234567890',
    });

    const rateLimit = extractRateLimit(headers);

    expect(rateLimit).toBeUndefined();
  });

  it('should support custom header prefix', () => {
    const headers = new Headers({
      'x-rate-limit': '100',
      'x-rate-remaining': '80',
      'x-rate-reset': '9876543210',
    });

    const rateLimit = extractRateLimit(headers, 'x-rate');

    expect(rateLimit).toEqual({
      limit: 100,
      remaining: 80,
      reset: 9876543210,
    });
  });

  it('should handle zero remaining', () => {
    const headers = new Headers({
      'x-ratelimit-limit': '60',
      'x-ratelimit-remaining': '0',
      'x-ratelimit-reset': '1234567890',
    });

    const rateLimit = extractRateLimit(headers);

    expect(rateLimit?.remaining).toBe(0);
  });

  it('should parse numeric strings correctly', () => {
    const headers = new Headers({
      'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '4999',
      'x-ratelimit-reset': '1700000000',
    });

    const rateLimit = extractRateLimit(headers);

    expect(rateLimit?.limit).toBe(5000);
    expect(rateLimit?.remaining).toBe(4999);
    expect(rateLimit?.reset).toBe(1700000000);
  });
});
