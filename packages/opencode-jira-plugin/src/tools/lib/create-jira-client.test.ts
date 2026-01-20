/**
 * Tests for createJiraClient
 * Run: bun test src/tools/lib/create-jira-client.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';

import { createJiraClient } from './create-jira-client.ts';

describe('createJiraClient', () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env.JIRA_URL = 'https://example.atlassian.net';
    process.env.JIRA_EMAIL = 'test@example.com';
    process.env.JIRA_API_TOKEN = 'test-token';

    globalThis.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({}),
    })) as typeof fetch;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
  });

  describe('factory function', () => {
    it('should create client with explicit config', () => {
      const client = createJiraClient({
        baseUrl: 'https://custom.atlassian.net',
        email: 'user@example.com',
        apiToken: 'custom-token',
      });

      expect(client).toBeDefined();
      expect(client.searchIssues).toBeInstanceOf(Function);
      expect(client.getIssue).toBeInstanceOf(Function);
      expect(client.getProjects).toBeInstanceOf(Function);
      expect(client.getProject).toBeInstanceOf(Function);
      expect(client.getProjectsPaginated).toBeInstanceOf(Function);
    });

    it('should create client with environment variables', () => {
      const client = createJiraClient();

      expect(client).toBeDefined();
    });

    it('should throw error when config is invalid', () => {
      delete process.env.JIRA_URL;
      delete process.env.JIRA_BASE_URL;

      expect(() => createJiraClient()).toThrow('Base URL is required');
    });
  });

  describe('searchIssues', () => {
    it('should call search endpoint with JQL', async () => {
      globalThis.fetch = mock(async () => ({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ issues: [], total: 0 }),
      })) as typeof fetch;

      const client = createJiraClient();
      const result = await client.searchIssues({ jql: 'project = TEST' });

      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('total');
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it('should send POST request with search parameters', async () => {
      let capturedBody: string | undefined;

      globalThis.fetch = mock(async (_url: string | URL | Request, options?: RequestInit) => {
        capturedBody = options?.body as string;
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ issues: [], total: 0 }),
        } as Response;
      });

      const client = createJiraClient();
      await client.searchIssues({
        jql: 'project = TEST',
        maxResults: 50,
        startAt: 0,
      });

      expect(capturedBody).toContain('project = TEST');
      expect(capturedBody).toContain('50');
    });
  });

  describe('getIssue', () => {
    it('should fetch single issue by key', async () => {
      globalThis.fetch = mock(async () => ({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ key: 'TEST-123', fields: {} }),
      })) as typeof fetch;

      const client = createJiraClient();
      const result = await client.getIssue('TEST-123');

      expect(result).toHaveProperty('key');
      expect(result.key).toBe('TEST-123');
    });

    it('should include fields parameter when provided', async () => {
      let capturedUrl: string | undefined;

      globalThis.fetch = mock(async (url: string | URL | Request) => {
        capturedUrl = url.toString();
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ key: 'TEST-123' }),
        } as Response;
      });

      const client = createJiraClient();
      await client.getIssue('TEST-123', ['summary', 'status']);

      expect(capturedUrl).toContain('fields=summary,status');
    });

    it('should include expand parameter when provided', async () => {
      let capturedUrl: string | undefined;

      globalThis.fetch = mock(async (url: string | URL | Request) => {
        capturedUrl = url.toString();
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ key: 'TEST-123' }),
        } as Response;
      });

      const client = createJiraClient();
      await client.getIssue('TEST-123', undefined, ['changelog']);

      expect(capturedUrl).toContain('expand=changelog');
    });
  });

  describe('getProjects', () => {
    it('should fetch all projects', async () => {
      globalThis.fetch = mock(async () => ({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => [{ key: 'TEST' }, { key: 'DEMO' }],
      })) as typeof fetch;

      const client = createJiraClient();
      const result = await client.getProjects();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('getProject', () => {
    it('should fetch single project by key', async () => {
      globalThis.fetch = mock(async () => ({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ key: 'TEST', name: 'Test Project' }),
      })) as typeof fetch;

      const client = createJiraClient();
      const result = await client.getProject('TEST');

      expect(result).toHaveProperty('key');
      expect(result.key).toBe('TEST');
    });
  });

  describe('getProjectsPaginated', () => {
    it('should fetch projects with pagination', async () => {
      globalThis.fetch = mock(async () => ({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          values: [{ key: 'TEST' }],
          total: 1,
          startAt: 0,
          maxResults: 50,
        }),
      })) as typeof fetch;

      const client = createJiraClient();
      const result = await client.getProjectsPaginated(0, 50);

      expect(result).toHaveProperty('values');
      expect(result).toHaveProperty('total');
    });

    it('should include query parameter when provided', async () => {
      let capturedUrl: string | undefined;

      globalThis.fetch = mock(async (url: string | URL | Request) => {
        capturedUrl = url.toString();
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ values: [], total: 0 }),
        } as Response;
      });

      const client = createJiraClient();
      await client.getProjectsPaginated(0, 50, 'test');

      expect(capturedUrl).toContain('query=test');
    });
  });
});
