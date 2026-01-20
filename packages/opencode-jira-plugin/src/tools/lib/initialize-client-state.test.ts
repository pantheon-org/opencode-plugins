/**
 * Tests for initializeClientState
 * Run: bun test src/tools/lib/initialize-client-state.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { initializeClientState } from './initialize-client-state.ts';

describe('initializeClientState', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.JIRA_URL = 'https://example.atlassian.net';
    process.env.JIRA_EMAIL = 'test@example.com';
    process.env.JIRA_API_TOKEN = 'test-token';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('config priority', () => {
    it('should use explicit config over environment variables', () => {
      const state = initializeClientState({
        baseUrl: 'https://custom.atlassian.net',
        email: 'custom@example.com',
        apiToken: 'custom-token',
      });

      expect(state.baseUrl).toBe('https://custom.atlassian.net');
      expect(state.email).toBe('custom@example.com');
      expect(state.apiToken).toBe('custom-token');
    });

    it('should use environment variables when config is empty', () => {
      const state = initializeClientState({});

      expect(state.baseUrl).toBe('https://example.atlassian.net');
      expect(state.email).toBe('test@example.com');
      expect(state.apiToken).toBe('test-token');
    });

    it('should prefer JIRA_URL over JIRA_BASE_URL', () => {
      process.env.JIRA_URL = 'https://primary.atlassian.net';
      process.env.JIRA_BASE_URL = 'https://secondary.atlassian.net';

      const state = initializeClientState({});
      expect(state.baseUrl).toBe('https://primary.atlassian.net');
    });

    it('should fall back to JIRA_BASE_URL when JIRA_URL is not set', () => {
      delete process.env.JIRA_URL;
      process.env.JIRA_BASE_URL = 'https://fallback.atlassian.net';

      const state = initializeClientState({});
      expect(state.baseUrl).toBe('https://fallback.atlassian.net');
    });

    it('should prefer JIRA_EMAIL over JIRA_USERNAME', () => {
      process.env.JIRA_EMAIL = 'primary@example.com';
      process.env.JIRA_USERNAME = 'secondary@example.com';

      const state = initializeClientState({});
      expect(state.email).toBe('primary@example.com');
    });

    it('should fall back to JIRA_USERNAME when JIRA_EMAIL is not set', () => {
      delete process.env.JIRA_EMAIL;
      process.env.JIRA_USERNAME = 'username@example.com';

      const state = initializeClientState({});
      expect(state.email).toBe('username@example.com');
    });
  });

  describe('validation', () => {
    it('should throw error when baseUrl is missing', () => {
      delete process.env.JIRA_URL;
      delete process.env.JIRA_BASE_URL;

      expect(() => initializeClientState({})).toThrow('Base URL is required');
    });

    it('should throw error when email is missing', () => {
      delete process.env.JIRA_EMAIL;
      delete process.env.JIRA_USERNAME;

      expect(() => initializeClientState({})).toThrow('Email is required');
    });

    it('should throw error when apiToken is missing', () => {
      delete process.env.JIRA_API_TOKEN;

      expect(() => initializeClientState({})).toThrow('API token is required');
    });
  });

  describe('default values', () => {
    it('should set default timeout to 30000ms', () => {
      const state = initializeClientState({});
      expect(state.timeout).toBe(30000);
    });

    it('should use custom timeout when provided', () => {
      const state = initializeClientState({ timeout: 5000 });
      expect(state.timeout).toBe(5000);
    });

    it('should set default userAgent', () => {
      const state = initializeClientState({});
      expect(state.userAgent).toBe('OpenCode-Jira-Tools/1.0.0');
    });
  });

  describe('state structure', () => {
    it('should return complete state object', () => {
      const state = initializeClientState({
        baseUrl: 'https://test.atlassian.net',
        email: 'test@example.com',
        apiToken: 'test-token',
        timeout: 10000,
      });

      expect(state).toHaveProperty('baseUrl');
      expect(state).toHaveProperty('email');
      expect(state).toHaveProperty('apiToken');
      expect(state).toHaveProperty('timeout');
      expect(state).toHaveProperty('userAgent');
    });
  });
});
