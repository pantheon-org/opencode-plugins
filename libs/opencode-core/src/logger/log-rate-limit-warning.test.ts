/**
 * Tests for logRateLimitWarning
 */

import type { PluginLogger } from '../types/logger-types';

import { logRateLimitWarning } from './log-rate-limit-warning';

describe('logRateLimitWarning', () => {
  const createMockLogger = (): PluginLogger => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  });

  it('should log warning when remaining percentage is below 10%', () => {
    const logger = createMockLogger();
    const rateLimit = {
      limit: 100,
      remaining: 5, // 5% remaining
      reset: Math.floor(Date.now() / 1000) + 3600,
    };

    logRateLimitWarning(logger, rateLimit);

    expect(logger.warn).toHaveBeenCalledWith(
      'API rate limit approaching',
      expect.objectContaining({
        remaining: 5,
        limit: 100,
        resetAt: expect.any(String),
      }),
    );
  });

  it('should not log warning when remaining percentage is above 10%', () => {
    const logger = createMockLogger();
    const rateLimit = {
      limit: 100,
      remaining: 50, // 50% remaining
      reset: Math.floor(Date.now() / 1000) + 3600,
    };

    logRateLimitWarning(logger, rateLimit);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should handle edge case of exactly 10% remaining', () => {
    const logger = createMockLogger();
    const rateLimit = {
      limit: 100,
      remaining: 10, // Exactly 10% remaining
      reset: Math.floor(Date.now() / 1000) + 3600,
    };

    logRateLimitWarning(logger, rateLimit);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('should format reset timestamp as ISO string', () => {
    const logger = createMockLogger();
    const resetTimestamp = Math.floor(Date.now() / 1000) + 3600;
    const rateLimit = {
      limit: 60,
      remaining: 3, // 5% remaining
      reset: resetTimestamp,
    };

    logRateLimitWarning(logger, rateLimit);

    expect(logger.warn).toHaveBeenCalledWith(
      'API rate limit approaching',
      expect.objectContaining({
        resetAt: new Date(resetTimestamp * 1000).toISOString(),
      }),
    );
  });
});
