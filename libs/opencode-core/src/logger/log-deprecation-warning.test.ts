/**
 * Tests for logDeprecationWarning
 */

import type { PluginLogger } from '../types/logger-types';

import { logDeprecationWarning } from './log-deprecation-warning';

describe('logDeprecationWarning', () => {
  const createMockLogger = (): PluginLogger => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  });

  it('should log basic deprecation warning', () => {
    const logger = createMockLogger();
    const endpoint = '/v1/organizations';

    logDeprecationWarning(logger, endpoint);

    expect(logger.warn).toHaveBeenCalledWith(
      'API endpoint deprecated: /v1/organizations',
      expect.objectContaining({
        endpoint: '/v1/organizations',
      }),
    );
  });

  it('should include sunset date when provided', () => {
    const logger = createMockLogger();
    const endpoint = '/v1/organizations';
    const options = { sunset: '2026-12-31' };

    logDeprecationWarning(logger, endpoint, options);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('(sunset: 2026-12-31)'),
      expect.objectContaining({
        endpoint: '/v1/organizations',
        sunset: '2026-12-31',
      }),
    );
  });

  it('should include replacement when provided', () => {
    const logger = createMockLogger();
    const endpoint = '/v1/organizations';
    const options = { replacement: '/v2/organizations' };

    logDeprecationWarning(logger, endpoint, options);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('use /v2/organizations instead'),
      expect.objectContaining({
        endpoint: '/v1/organizations',
        replacement: '/v2/organizations',
      }),
    );
  });

  it('should include custom message in metadata', () => {
    const logger = createMockLogger();
    const endpoint = '/v1/organizations';
    const options = {
      message: 'This endpoint will be removed in the next major version',
    };

    logDeprecationWarning(logger, endpoint, options);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        deprecationMessage: 'This endpoint will be removed in the next major version',
      }),
    );
  });

  it('should handle all options together', () => {
    const logger = createMockLogger();
    const endpoint = '/v1/organizations';
    const options = {
      sunset: '2026-12-31',
      replacement: '/v2/organizations',
      message: 'Please migrate to v2 API',
    };

    logDeprecationWarning(logger, endpoint, options);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('sunset: 2026-12-31'),
      expect.objectContaining({
        endpoint: '/v1/organizations',
        sunset: '2026-12-31',
        replacement: '/v2/organizations',
        deprecationMessage: 'Please migrate to v2 API',
      }),
    );
  });
});
