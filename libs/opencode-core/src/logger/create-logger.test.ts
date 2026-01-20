/**
 * Tests for createLogger
 */

import type { LoggerConfig } from '../types/logger-types';

import { createLogger } from './create-logger';

describe('createLogger', () => {
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;
  let originalDebugEnv: string | undefined;

  beforeEach(() => {
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
    originalDebugEnv = process.env.DEBUG_OPENCODE;
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    process.env.DEBUG_OPENCODE = originalDebugEnv;
  });

  it('should create a logger with plugin name', () => {
    const config: LoggerConfig = { plugin: 'test-plugin' };
    const logger = createLogger(config);

    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should create a logger with plugin and tool name', () => {
    const config: LoggerConfig = {
      plugin: 'test-plugin',
      tool: 'test-tool',
    };
    const logger = createLogger(config);

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should output structured JSON to stdout for info', () => {
    const config: LoggerConfig = { plugin: 'test-plugin' };
    const logger = createLogger(config);

    logger.info('test message', { key: 'value' });

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const output = stdoutSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.level).toBe('info');
    expect(parsed.module).toBe('opencode-plugin-test-plugin');
    expect(parsed.message).toBe('test message');
    expect(parsed.context).toEqual({ key: 'value' });
    expect(parsed.timestamp).toBeDefined();
  });

  it('should output structured JSON to stderr for warn', () => {
    const config: LoggerConfig = { plugin: 'test-plugin' };
    const logger = createLogger(config);

    logger.warn('test warning', { count: 5 });

    expect(stderrSpy).toHaveBeenCalledTimes(1);
    const output = stderrSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.level).toBe('warn');
    expect(parsed.module).toBe('opencode-plugin-test-plugin');
    expect(parsed.message).toBe('test warning');
    expect(parsed.context).toEqual({ count: 5 });
  });

  it('should output structured JSON to stderr for error', () => {
    const config: LoggerConfig = { plugin: 'test-plugin' };
    const logger = createLogger(config);

    logger.error('test error', { error: 'details' });

    expect(stderrSpy).toHaveBeenCalledTimes(1);
    const output = stderrSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('test error');
    expect(parsed.context).toEqual({ error: 'details' });
  });

  it('should include tool name in module when provided', () => {
    const config: LoggerConfig = {
      plugin: 'test-plugin',
      tool: 'test-tool',
    };
    const logger = createLogger(config);

    logger.info('test message');

    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const output = stdoutSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.module).toBe('opencode-plugin-test-plugin:test-tool');
  });

  it('should only output debug when DEBUG_OPENCODE is set', () => {
    const config: LoggerConfig = { plugin: 'test-plugin' };
    const logger = createLogger(config);

    // Debug without env var - should not output
    delete process.env.DEBUG_OPENCODE;
    logger.debug('debug message');
    expect(stdoutSpy).not.toHaveBeenCalled();

    // Debug with env var - should output
    process.env.DEBUG_OPENCODE = 'true';
    logger.debug('debug message', { debug: true });
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    const output = stdoutSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.level).toBe('debug');
    expect(parsed.message).toBe('debug message');
  });

  it('should not include context when metadata is undefined', () => {
    const config: LoggerConfig = { plugin: 'test-plugin' };
    const logger = createLogger(config);

    logger.info('test message');

    const output = stdoutSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.context).toBeUndefined();
  });

  it('should support consoleFallback option', () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    const config: LoggerConfig = {
      plugin: 'test-plugin',
      consoleFallback: true,
    };
    const logger = createLogger(config);

    logger.info('test with fallback', { meta: 'data' });

    // Should output both structured and console
    expect(stdoutSpy).toHaveBeenCalledTimes(1);
    expect(consoleInfoSpy).toHaveBeenCalledWith('[opencode-plugin-test-plugin]', 'test with fallback', {
      meta: 'data',
    });

    consoleInfoSpy.mockRestore();
  });

  it('should include console fallback for all log levels', () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();

    process.env.DEBUG_OPENCODE = 'true';

    const config: LoggerConfig = {
      plugin: 'test',
      consoleFallback: true,
    };
    const logger = createLogger(config);

    logger.info('info');
    logger.warn('warn');
    logger.error('error');
    logger.debug('debug');

    expect(consoleInfoSpy).toHaveBeenCalledWith('[opencode-plugin-test]', 'info', '');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[opencode-plugin-test]', 'warn', '');
    expect(consoleErrorSpy).toHaveBeenCalledWith('[opencode-plugin-test]', 'error', '');
    expect(consoleDebugSpy).toHaveBeenCalledWith('[opencode-plugin-test]', 'debug', '');

    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });
});
