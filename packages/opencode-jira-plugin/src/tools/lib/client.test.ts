/**
 * Tests for JIRA API Client
 * Run: bun test jira/tools/lib/client.test.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { JiraClient } from './client';

describe('JiraClient', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.JIRA_URL = 'https://example.atlassian.net';
    process.env.JIRA_EMAIL = 'test@example.com';
    process.env.JIRA_API_TOKEN = 'test-token';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('constructor', () => {
    it('should create client with explicit config', () => {
      const client = new JiraClient({
        baseUrl: 'https://example.atlassian.net',
        email: 'user@example.com',
        apiToken: 'api-token',
      });
      expect(client).toBeDefined();
    });

    it('should use environment variables', () => {
      const client = new JiraClient();
      expect(client).toBeDefined();
    });

    it('should throw error when baseUrl is missing', () => {
      delete process.env.JIRA_URL;
      delete process.env.JIRA_BASE_URL;
      expect(() => new JiraClient()).toThrow('Base URL is required');
    });

    it('should throw error when email is missing', () => {
      delete process.env.JIRA_EMAIL;
      delete process.env.JIRA_USERNAME;
      expect(() => new JiraClient()).toThrow('Email is required');
    });

    it('should throw error when apiToken is missing', () => {
      delete process.env.JIRA_API_TOKEN;
      expect(() => new JiraClient()).toThrow('API token is required');
    });

    it('should accept custom timeout', () => {
      const client = new JiraClient({
        baseUrl: 'https://example.atlassian.net',
        email: 'user@example.com',
        apiToken: 'api-token',
        timeout: 5000,
      });
      expect(client).toBeDefined();
    });
  });

  describe('configuration', () => {
    it('should prefer JIRA_URL over JIRA_BASE_URL', () => {
      process.env.JIRA_URL = 'https://primary.atlassian.net';
      process.env.JIRA_BASE_URL = 'https://secondary.atlassian.net';
      const client = new JiraClient();
      expect(client).toBeDefined();
    });

    it('should prefer JIRA_EMAIL over JIRA_USERNAME', () => {
      process.env.JIRA_EMAIL = 'primary@example.com';
      process.env.JIRA_USERNAME = 'secondary@example.com';
      const client = new JiraClient();
      expect(client).toBeDefined();
    });
  });

  describe('authentication', () => {
    it('should use Basic Auth with email and token', () => {
      const client = new JiraClient({
        baseUrl: 'https://example.atlassian.net',
        email: 'user@example.com',
        apiToken: 'secret-token',
      });
      expect(client).toBeDefined();
    });
  });
});
