/**
 * Tests for GitLab API Client
 * Run: bun test gitlab/tools/lib/client.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';

import { createClientConfig, listRepositories } from './client.ts';

describe('GitLab Client', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.GITLAB_TOKEN = 'test-token';
    process.env.GITLAB_API_URL = 'https://gitlab.com/api/v4';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('createClientConfig', () => {
    it('should create config with explicit values', () => {
      const config = createClientConfig({
        baseUrl: 'https://gitlab.example.com/api/v4',
        token: 'test-token',
      });

      expect(config.baseUrl).toBe('https://gitlab.example.com/api/v4');
      expect(config.token).toBe('test-token');
      expect(config.timeout).toBe(30000);
    });

    it('should use GITLAB_TOKEN from environment', () => {
      const config = createClientConfig({
        baseUrl: 'https://gitlab.com/api/v4',
      });

      expect(config.token).toBe('test-token');
    });

    it('should throw error when token is missing', () => {
      delete process.env.GITLAB_TOKEN;

      expect(() => createClientConfig({ baseUrl: 'https://gitlab.com/api/v4' })).toThrow('GitLab token is required');
    });

    it('should remove trailing slash from baseUrl', () => {
      const config = createClientConfig({
        baseUrl: 'https://gitlab.com/api/v4/',
        token: 'test-token',
      });

      expect(config.baseUrl).toBe('https://gitlab.com/api/v4');
    });

    it('should use default baseUrl when not provided', () => {
      delete process.env.GITLAB_API_URL;
      delete process.env.GITLAB_URL;

      const config = createClientConfig();

      expect(config.baseUrl).toBe('https://gitlab.com/api/v4');
    });

    it('should accept custom timeout', () => {
      const config = createClientConfig({
        baseUrl: 'https://gitlab.com/api/v4',
        token: 'test-token',
        timeout: 5000,
      });

      expect(config.timeout).toBe(5000);
    });
  });

  describe('URL construction', () => {
    it('should prefer GITLAB_API_URL over GITLAB_URL', () => {
      process.env.GITLAB_API_URL = 'https://api.gitlab.com/v4';
      process.env.GITLAB_URL = 'https://gitlab.com/api/v4';

      const config = createClientConfig();

      expect(config.baseUrl).toBe('https://api.gitlab.com/v4');
    });

    it('should fallback to GITLAB_URL if GITLAB_API_URL not set', () => {
      delete process.env.GITLAB_API_URL;
      process.env.GITLAB_URL = 'https://gitlab.com/api/v4';

      const config = createClientConfig();

      expect(config.baseUrl).toBe('https://gitlab.com/api/v4');
    });
  });

  describe('configuration validation', () => {
    it('should require token from config or environment', () => {
      delete process.env.GITLAB_TOKEN;

      expect(() => createClientConfig({ baseUrl: 'https://gitlab.com/api/v4' })).toThrow();
    });

    it('should accept token from config when env var not set', () => {
      delete process.env.GITLAB_TOKEN;

      const config = createClientConfig({
        baseUrl: 'https://gitlab.com/api/v4',
        token: 'explicit-token',
      });

      expect(config.token).toBe('explicit-token');
    });
  });
});
