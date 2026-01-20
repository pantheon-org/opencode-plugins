/**
 * Tests for createToolLogger
 */

import { createToolLogger } from './create-tool-logger';

describe('createToolLogger', () => {
  it('should create a tool-specific logger', () => {
    const logger = createToolLogger('test-plugin', 'test-tool');

    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should create logger with correct plugin and tool context', () => {
    const logger = createToolLogger('snyk', 'list-orgs');

    expect(logger).toBeDefined();
    expect(() => logger.info('Fetching organizations')).not.toThrow();
  });

  it('should accept metadata in logger methods', () => {
    const logger = createToolLogger('test-plugin', 'test-tool');

    expect(() => logger.info('Operation started', { count: 10 })).not.toThrow();
    expect(() => logger.debug('Debug info', { timestamp: Date.now() })).not.toThrow();
  });
});
