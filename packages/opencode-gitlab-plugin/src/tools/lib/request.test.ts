/**
 * Tests for request module
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';

import { request } from './request.ts';
import type { GitLabClientConfig } from './types.ts';

describe('request', () => {
  const mockConfig: Required<GitLabClientConfig> = {
    baseUrl: 'https://gitlab.com/api/v4',
    token: 'test-token',
    timeout: 5000,
  };

  beforeEach(() => {
    // Clear any previous mocks
    global.fetch = fetch;
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = fetch;
  });

  it('should make successful GET request', async () => {
    const mockData = { id: 1, name: 'test' };
    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockData,
    })) as any;

    const response = await request('/test', mockConfig, { method: 'GET' });

    expect(response.data).toEqual(mockData);
    expect(response.status).toBe(200);
  });

  it('should include Authorization header', async () => {
    let capturedHeaders: Headers;
    global.fetch = mock(async (_url: any, options: any) => {
      capturedHeaders = options.headers;
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
    }) as any;

    await request('/test', mockConfig);

    expect(capturedHeaders!.get('Authorization')).toBe('Bearer test-token');
  });

  it('should include Accept and User-Agent headers', async () => {
    let capturedHeaders: Headers;
    global.fetch = mock(async (_url: any, options: any) => {
      capturedHeaders = options.headers;
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
    }) as any;

    await request('/test', mockConfig);

    expect(capturedHeaders!.get('Accept')).toBe('application/json');
    expect(capturedHeaders!.get('User-Agent')).toBe('OpenCode-GitLab-Tools/1.0.0');
  });

  it('should include Content-Type header for POST requests', async () => {
    let capturedHeaders: Headers;
    global.fetch = mock(async (_url: any, options: any) => {
      capturedHeaders = options.headers;
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
    }) as any;

    await request('/test', mockConfig, { method: 'POST' });

    expect(capturedHeaders!.get('Content-Type')).toBe('application/json');
  });

  it('should construct correct URL', async () => {
    let capturedUrl: string = '';
    global.fetch = mock(async (url: any) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
    }) as any;

    await request('/projects', mockConfig);

    expect(capturedUrl).toBe('https://gitlab.com/api/v4/projects');
  });

  it('should throw error for non-ok response', async () => {
    global.fetch = mock(async () => ({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    })) as any;

    await expect(request('/test', mockConfig)).rejects.toThrow('HTTP 404: Not Found');
  });

  it('should handle JSON parse errors', async () => {
    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => {
        throw new Error('Invalid JSON');
      },
    })) as any;

    await expect(request('/test', mockConfig)).rejects.toThrow('Invalid JSON');
  });
});
