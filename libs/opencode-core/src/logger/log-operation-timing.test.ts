/**
 * Tests for logOperationTiming
 */

import { logOperationTiming } from './log-operation-timing';
import type { PluginLogger } from '../types/logger-types';

describe('logOperationTiming', () => {
  const createMockLogger = (): PluginLogger => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  });

  it('should log warning for slow operations (above default threshold)', () => {
    const logger = createMockLogger();
    const operation = 'fetch-data';
    const duration = 6000; // 6 seconds

    logOperationTiming(logger, operation, duration);

    expect(logger.warn).toHaveBeenCalledWith(
      'Slow operation detected',
      expect.objectContaining({
        operation: 'fetch-data',
        duration: 6000,
        unit: 'ms',
      }),
    );
  });

  it('should log debug for fast operations (below default threshold)', () => {
    const logger = createMockLogger();
    const operation = 'fetch-data';
    const duration = 1000; // 1 second

    logOperationTiming(logger, operation, duration);

    expect(logger.debug).toHaveBeenCalledWith(
      'Operation completed',
      expect.objectContaining({
        operation: 'fetch-data',
        duration: 1000,
        unit: 'ms',
      }),
    );
  });

  it('should use custom threshold', () => {
    const logger = createMockLogger();
    const operation = 'quick-check';
    const duration = 1500;
    const threshold = 1000;

    logOperationTiming(logger, operation, duration, threshold);

    expect(logger.warn).toHaveBeenCalledWith(
      'Slow operation detected',
      expect.objectContaining({
        operation: 'quick-check',
        duration: 1500,
      }),
    );
  });

  it('should handle edge case of duration equal to threshold', () => {
    const logger = createMockLogger();
    const operation = 'test-operation';
    const duration = 5000;
    const threshold = 5000;

    logOperationTiming(logger, operation, duration, threshold);

    // Duration equal to threshold should not trigger warning
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it('should include unit in metadata', () => {
    const logger = createMockLogger();
    const operation = 'test';
    const duration = 100;

    logOperationTiming(logger, operation, duration);

    expect(logger.debug).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        unit: 'ms',
      }),
    );
  });
});
