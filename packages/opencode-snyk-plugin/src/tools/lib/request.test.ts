/**
 * Tests for request module
 */

import { beforeEach, describe, expect, it, mock } from 'bun:test';

import type { SnykClientConfig } from './create-client.ts';
import { request } from './request.ts';

const mockClient: SnykClientConfig = {
  token: 'test-token',
  baseUrl: 'https://api.snyk.io',
  apiVersion: '2023-06-22',
  timeout: 30000,
};

describe('request', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = mock(() => Promise.resolve(new Response('{}', { status: 200 }))) as any;
  });

  it('makes GET request with correct headers', async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/vnd.api+json' },
        }),
      ),
    );
    global.fetch = fetchMock as any;

    await request(mockClient, '/rest/orgs');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];

    expect(url).toContain('/rest/orgs');
    expect(url).toContain('version=2023-06-22');

    const headers = options.headers as Headers;
    expect(headers.get('Authorization')).toBe('token test-token');
    expect(headers.get('Content-Type')).toBe('application/vnd.api+json');
    expect(headers.get('Accept')).toBe('application/vnd.api+json');
    expect(headers.get('User-Agent')).toBe('OpenCode-Snyk-Tools/1.0.0');
  });

  it('includes pagination parameters in URL', async () => {
    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify({ data: [] }), { status: 200 })));
    global.fetch = fetchMock as any;

    await request(mockClient, '/rest/orgs', {
      pagination: { limit: 50, starting_after: 'cursor123' },
    });

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('limit=50');
    expect(url).toContain('starting_after=cursor123');
  });

  it('throws error on non-200 response', async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response('{"message":"Not Found"}', {
          status: 404,
        }),
      ),
    ) as any;

    await expect(request(mockClient, '/rest/orgs/invalid')).rejects.toThrow('Snyk API error (404)');
  });

  it('throws error on timeout', async () => {
    const shortTimeoutClient = { ...mockClient, timeout: 100 };

    global.fetch = mock((url, options) => {
      return new Promise((resolve, reject) => {
        const signal = options?.signal as AbortSignal | undefined;

        if (signal) {
          signal.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted', 'AbortError'));
          });
        }

        // Simulate slow response that will be aborted
        setTimeout(() => resolve(new Response('{}', { status: 200 })), 200);
      });
    }) as any;

    await expect(request(shortTimeoutClient, '/rest/orgs')).rejects.toThrow('Request timeout after 100ms');
  });

  it('parses JSON response', async () => {
    const responseData = { data: [{ id: '1', attributes: { name: 'Test' } }] };

    global.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify(responseData), {
          status: 200,
        }),
      ),
    ) as any;

    const result = await request(mockClient, '/rest/orgs');

    expect(result).toEqual(responseData);
  });

  it('supports POST requests', async () => {
    const fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 201 })));
    global.fetch = fetchMock as any;

    const postData = { name: 'New Resource' };

    await request(mockClient, '/rest/orgs', {
      method: 'POST',
      body: JSON.stringify(postData),
    });

    const [, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify(postData));
  });
});
