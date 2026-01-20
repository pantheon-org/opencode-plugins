/**
 * Tests for extract-metadata module
 */

import { describe, expect, it } from 'bun:test';

import { extractMetadata } from './extract-metadata.ts';

describe('extractMetadata', () => {
  it('extracts deprecation header', () => {
    const response = new Response('{}', {
      headers: {
        deprecation: 'true',
      },
    });

    const metadata = extractMetadata(response);

    expect(metadata.deprecation).toBe('true');
  });

  it('extracts sunset header', () => {
    const response = new Response('{}', {
      headers: {
        sunset: '2025-12-31',
      },
    });

    const metadata = extractMetadata(response);

    expect(metadata.sunset).toBe('2025-12-31');
  });

  it('extracts request ID', () => {
    const response = new Response('{}', {
      headers: {
        'x-request-id': 'req-123',
      },
    });

    const metadata = extractMetadata(response);

    expect(metadata.requestId).toBe('req-123');
  });

  it('extracts rate limit information', () => {
    const response = new Response('{}', {
      headers: {
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '75',
        'x-ratelimit-reset': '1609459200',
      },
    });

    const metadata = extractMetadata(response);

    expect(metadata.rateLimit).toEqual({
      limit: 100,
      remaining: 75,
      reset: 1609459200,
    });
  });

  it('does not include rate limit if headers incomplete', () => {
    const response = new Response('{}', {
      headers: {
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '75',
        // Missing x-ratelimit-reset
      },
    });

    const metadata = extractMetadata(response);

    expect(metadata.rateLimit).toBeUndefined();
  });

  it('extracts multiple metadata fields', () => {
    const response = new Response('{}', {
      headers: {
        deprecation: 'true',
        sunset: '2025-12-31',
        'x-request-id': 'req-456',
        'x-ratelimit-limit': '200',
        'x-ratelimit-remaining': '150',
        'x-ratelimit-reset': '1609459300',
      },
    });

    const metadata = extractMetadata(response);

    expect(metadata.deprecation).toBe('true');
    expect(metadata.sunset).toBe('2025-12-31');
    expect(metadata.requestId).toBe('req-456');
    expect(metadata.rateLimit).toEqual({
      limit: 200,
      remaining: 150,
      reset: 1609459300,
    });
  });

  it('returns empty object if no relevant headers present', () => {
    const response = new Response('{}', {
      headers: {
        'content-type': 'application/json',
      },
    });

    const metadata = extractMetadata(response);

    expect(metadata).toEqual({});
  });
});
