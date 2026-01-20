/**
 * Tests for create-client-config
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { createClientConfig } from './create-client-config.ts';

describe('createClientConfig', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.GITLAB_TOKEN = 'test-token';
    process.env.GITLAB_API_URL = 'https://gitlab.com/api/v4';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should create config with explicit values', () => {
    const config = createClientConfig({
      baseUrl: 'https://gitlab.example.com/api/v4',
      token: 'explicit-token',
      timeout: 5000,
    });

    expect(config.baseUrl).toBe('https://gitlab.example.com/api/v4');
    expect(config.token).toBe('explicit-token');
    expect(config.timeout).toBe(5000);
  });

  it('should use GITLAB_TOKEN from environment', () => {
    const config = createClientConfig({
      baseUrl: 'https://gitlab.com/api/v4',
    });

    expect(config.token).toBe('test-token');
  });

  it('should use GITLAB_API_URL from environment', () => {
    process.env.GITLAB_API_URL = 'https://custom.gitlab.com/api/v4';

    const config = createClientConfig();

    expect(config.baseUrl).toBe('https://custom.gitlab.com/api/v4');
  });

  it('should prefer GITLAB_API_URL over GITLAB_URL', () => {
    process.env.GITLAB_API_URL = 'https://api.gitlab.com/v4';
    process.env.GITLAB_URL = 'https://gitlab.com/api/v4';

    const config = createClientConfig();

    expect(config.baseUrl).toBe('https://api.gitlab.com/v4');
  });

  it('should fallback to GITLAB_URL if GITLAB_API_URL not set', () => {
    delete process.env.GITLAB_API_URL;
    process.env.GITLAB_URL = 'https://fallback.gitlab.com/api/v4';

    const config = createClientConfig();

    expect(config.baseUrl).toBe('https://fallback.gitlab.com/api/v4');
  });

  it('should use default baseUrl when not provided', () => {
    delete process.env.GITLAB_API_URL;
    delete process.env.GITLAB_URL;

    const config = createClientConfig();

    expect(config.baseUrl).toBe('https://gitlab.com/api/v4');
  });

  it('should remove trailing slash from baseUrl', () => {
    const config = createClientConfig({
      baseUrl: 'https://gitlab.com/api/v4/',
      token: 'test-token',
    });

    expect(config.baseUrl).toBe('https://gitlab.com/api/v4');
  });

  it('should use default timeout when not provided', () => {
    const config = createClientConfig();

    expect(config.timeout).toBe(30000);
  });

  it('should accept custom timeout', () => {
    const config = createClientConfig({
      timeout: 10000,
    });

    expect(config.timeout).toBe(10000);
  });

  it('should throw error when token is missing', () => {
    delete process.env.GITLAB_TOKEN;

    expect(() => createClientConfig({ baseUrl: 'https://gitlab.com/api/v4' })).toThrow('GitLab token is required');
  });

  it('should accept token from config when env var not set', () => {
    delete process.env.GITLAB_TOKEN;

    const config = createClientConfig({
      baseUrl: 'https://gitlab.com/api/v4',
      token: 'config-token',
    });

    expect(config.token).toBe('config-token');
  });

  it('should prefer explicit config token over environment variable', () => {
    process.env.GITLAB_TOKEN = 'env-token';

    const config = createClientConfig({
      token: 'explicit-token',
    });

    expect(config.token).toBe('explicit-token');
  });
});
