/**
 * Tests for generate-sbom module
 */

import { describe, expect, it, mock } from 'bun:test';

import type { SnykClientConfig } from './create-client.ts';
import { generateSBOM } from './generate-sbom.ts';

const mockClient: SnykClientConfig = {
  token: 'test-token',
  baseUrl: 'https://api.snyk.io',
  apiVersion: '2023-06-22',
  timeout: 30000,
};

describe('generateSBOM', () => {
  it('generates SBOM for project', async () => {
    const mockSBOM = {
      bomFormat: 'CycloneDX',
      specVersion: '1.6',
      serialNumber: 'urn:uuid:123',
      version: 1,
      metadata: {
        timestamp: '2024-01-01T00:00:00Z',
      },
      components: [
        {
          type: 'library',
          name: 'express',
          version: '4.18.0',
        },
      ],
    };

    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify(mockSBOM), { status: 200 }))) as any;

    const result = await generateSBOM(mockClient, 'org-123', 'proj-456', {
      format: 'cyclonedx1.6+json',
    });

    expect(result.bomFormat).toBe('CycloneDX');
    expect(Array.isArray(result.components)).toBe(true);
    expect((result.components as Array<{ name: string }>)[0].name).toBe('express');
  });

  it('includes format in URL query', async () => {
    const fetchMock = mock(() => Promise.resolve(new Response('{}', { status: 200 })));
    global.fetch = fetchMock as any;

    await generateSBOM(mockClient, 'org-123', 'proj-456', {
      format: 'spdx2.3+json',
    });

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('format=spdx2.3%2Bjson');
  });

  it('excludes licenses when specified', async () => {
    const fetchMock = mock(() => Promise.resolve(new Response('{}', { status: 200 })));
    global.fetch = fetchMock as any;

    await generateSBOM(mockClient, 'org-123', 'proj-456', {
      format: 'cyclonedx1.6+json',
      exclude: ['licenses'],
    });

    const [url] = fetchMock.mock.calls[0] as unknown as [string, RequestInit?];
    expect(url).toContain('exclude=licenses');
  });

  it('sets correct Accept header for JSON format', async () => {
    const fetchMock = mock(() => Promise.resolve(new Response('{}', { status: 200 })));
    global.fetch = fetchMock as any;

    await generateSBOM(mockClient, 'org-123', 'proj-456', {
      format: 'cyclonedx1.6+json',
    });

    const [, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = options.headers as Headers;
    expect(headers.get('Accept')).toBe('application/json');
  });

  it('sets correct Accept header for XML format', async () => {
    const fetchMock = mock(() => Promise.resolve(new Response('<xml></xml>', { status: 200 })));
    global.fetch = fetchMock as any;

    await generateSBOM(mockClient, 'org-123', 'proj-456', {
      format: 'cyclonedx1.6+xml',
    });

    const [, options] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const headers = options.headers as Headers;
    expect(headers.get('Accept')).toBe('application/xml');
  });

  it('throws error on API failure', async () => {
    global.fetch = mock(() =>
      Promise.resolve(
        new Response('{"message":"Not Found"}', {
          status: 404,
        }),
      ),
    ) as any;

    await expect(
      generateSBOM(mockClient, 'org-123', 'invalid', {
        format: 'cyclonedx1.6+json',
      }),
    ).rejects.toThrow('Snyk API error (404)');
  });

  it('handles timeout', async () => {
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

    await expect(
      generateSBOM(shortTimeoutClient, 'org-123', 'proj-456', {
        format: 'cyclonedx1.6+json',
      }),
    ).rejects.toThrow('Request timeout after 100ms');
  });
});
