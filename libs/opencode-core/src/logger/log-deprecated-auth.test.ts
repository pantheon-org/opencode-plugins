/**
 * Tests for logDeprecatedAuth
 */

import type { PluginLogger } from '../types/logger-types';

import { logDeprecatedAuth } from './log-deprecated-auth';

describe('logDeprecatedAuth', () => {
  const createMockLogger = (): PluginLogger => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  });

  it('should log deprecation warning for auth method', () => {
    const logger = createMockLogger();
    const authType = 'apiToken';
    const provider = 'snyk';

    logDeprecatedAuth(logger, authType, provider);

    expect(logger.warn).toHaveBeenCalledWith(
      'Deprecated authentication method: apiToken',
      expect.objectContaining({
        authType: 'apiToken',
        provider: 'snyk',
      }),
    );
  });

  it('should include migration instructions', () => {
    const logger = createMockLogger();
    const authType = 'envVar';
    const provider = 'gitlab';

    logDeprecatedAuth(logger, authType, provider);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        migration: 'Use: opencode auth gitlab',
      }),
    );
  });

  it('should include version information', () => {
    const logger = createMockLogger();
    const authType = 'basicAuth';
    const provider = 'jira';

    logDeprecatedAuth(logger, authType, provider);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        deprecationVersion: '2.0.0',
        removalVersion: '3.0.0',
      }),
    );
  });

  it('should handle different auth types', () => {
    const logger = createMockLogger();
    const authTypes = ['apiToken', 'apiKey', 'password', 'envVar'];

    authTypes.forEach((authType) => {
      logDeprecatedAuth(logger, authType, 'test-provider');
    });

    expect(logger.warn).toHaveBeenCalledTimes(authTypes.length);
  });
});
