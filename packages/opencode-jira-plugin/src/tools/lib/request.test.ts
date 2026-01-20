/**
 * Tests for request function
 * Run: bun test src/tools/lib/request.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';

import type { JiraClientState } from './initialize-client-state.ts';
import { request } from './request.ts';

describe('request', () => {
  const mockState: JiraClientState = {
    baseUrl: 'https://example.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token',
    timeout: 30000,
    userAgent: 'OpenCode-Jira-Tools/1.0.0',
  };

  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('successful requests', () => {
    it('should make GET request with correct headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ success: true }),
      };

      globalThis.fetch = mock(async () => mockResponse as Response);

      const result = await request(mockState, '/rest/api/3/test', { method: 'GET' });

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ success: true });
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should make POST request with JSON body', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        headers: new Headers(),
        json: async () => ({ id: '123' }),
      };

      globalThis.fetch = mock(async () => mockResponse as Response);

      const result = await request(mockState, '/rest/api/3/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      });

      expect(result.status).toBe(201);
      expect(result.data).toEqual({ id: '123' });
    });

    it('should set Authorization header', async () => {
      let capturedHeaders: Headers | undefined;

      globalThis.fetch = mock(async (_url: string | URL | Request, options?: RequestInit) => {
        capturedHeaders = options?.headers as Headers;
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({}),
        } as Response;
      });

      await request(mockState, '/rest/api/3/test');

      expect(capturedHeaders?.get('Authorization')).toMatch(/^Basic /);
    });

    it('should set Accept and User-Agent headers', async () => {
      let capturedHeaders: Headers | undefined;

      globalThis.fetch = mock(async (_url: string | URL | Request, options?: RequestInit) => {
        capturedHeaders = options?.headers as Headers;
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({}),
        } as Response;
      });

      await request(mockState, '/rest/api/3/test');

      expect(capturedHeaders?.get('Accept')).toBe('application/json');
      expect(capturedHeaders?.get('User-Agent')).toBe('OpenCode-Jira-Tools/1.0.0');
    });

    it('should set Content-Type for POST requests', async () => {
      let capturedHeaders: Headers | undefined;

      globalThis.fetch = mock(async (_url: string | URL | Request, options?: RequestInit) => {
        capturedHeaders = options?.headers as Headers;
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({}),
        } as Response;
      });

      await request(mockState, '/rest/api/3/test', { method: 'POST' });

      expect(capturedHeaders?.get('Content-Type')).toBe('application/json');
    });
  });

  describe('error handling', () => {
    it('should throw error for HTTP 4xx responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      };

      globalThis.fetch = mock(async () => mockResponse as Response);

      await expect(request(mockState, '/rest/api/3/missing')).rejects.toThrow('HTTP 404');
    });

    it('should throw error for HTTP 5xx responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      };

      globalThis.fetch = mock(async () => mockResponse as Response);

      await expect(request(mockState, '/rest/api/3/error')).rejects.toThrow('HTTP 500');
    });

    it('should handle timeout with AbortController', async () => {
      const shortTimeoutState: JiraClientState = { ...mockState, timeout: 10 };

      globalThis.fetch = mock(
        async (_url: string | URL | Request, options?: RequestInit) =>
          new Promise((resolve, reject) => {
            options?.signal?.addEventListener('abort', () => {
              reject(new Error('AbortError'));
            });
            setTimeout(() => resolve({} as Response), 100);
          }),
      );

      await expect(request(shortTimeoutState, '/rest/api/3/slow')).rejects.toThrow('timeout');
    });

    it('should throw error for network failures', async () => {
      globalThis.fetch = mock(async () => {
        throw new Error('Network error');
      });

      await expect(request(mockState, '/rest/api/3/test')).rejects.toThrow('Network error');
    });
  });

  describe('URL construction', () => {
    it('should construct full URL with baseUrl and endpoint', async () => {
      let capturedUrl: string | undefined;

      globalThis.fetch = mock(async (url: string | URL | Request) => {
        capturedUrl = url.toString();
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({}),
        } as Response;
      });

      await request(mockState, '/rest/api/3/test');

      expect(capturedUrl).toBe('https://example.atlassian.net/rest/api/3/test');
    });
  });
});
