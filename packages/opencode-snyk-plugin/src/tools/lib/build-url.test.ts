/**
 * Tests for build-url module
 */

import { describe, expect, it } from 'bun:test';

import { buildUrl } from './build-url.ts';
import type { SnykClientConfig } from './create-client.ts';

const mockClient: SnykClientConfig = {
  token: 'test-token',
  baseUrl: 'https://api.snyk.io',
  apiVersion: '2023-06-22',
  timeout: 30000,
};

describe('buildUrl', () => {
  it('builds basic URL with version', () => {
    const url = buildUrl(mockClient, '/rest/orgs');

    expect(url).toBe('https://api.snyk.io/rest/orgs?version=2023-06-22');
  });

  it('preserves existing query parameters', () => {
    const url = buildUrl(mockClient, '/rest/orgs?foo=bar');

    expect(url).toContain('foo=bar');
    expect(url).toContain('version=2023-06-22');
  });

  it('does not override existing version parameter', () => {
    const url = buildUrl(mockClient, '/rest/orgs?version=2024-01-01');

    expect(url).toBe('https://api.snyk.io/rest/orgs?version=2024-01-01');
    expect(url).not.toContain('2023-06-22');
  });

  it('adds limit pagination parameter', () => {
    const url = buildUrl(mockClient, '/rest/orgs', { limit: 50 });

    expect(url).toContain('limit=50');
    expect(url).toContain('version=2023-06-22');
  });

  it('adds starting_after pagination parameter', () => {
    const url = buildUrl(mockClient, '/rest/orgs', {
      starting_after: 'cursor123',
    });

    expect(url).toContain('starting_after=cursor123');
  });

  it('adds ending_before pagination parameter', () => {
    const url = buildUrl(mockClient, '/rest/orgs', {
      ending_before: 'cursor456',
    });

    expect(url).toContain('ending_before=cursor456');
  });

  it('adds multiple pagination parameters', () => {
    const url = buildUrl(mockClient, '/rest/orgs', {
      limit: 25,
      starting_after: 'cursor789',
    });

    expect(url).toContain('limit=25');
    expect(url).toContain('starting_after=cursor789');
    expect(url).toContain('version=2023-06-22');
  });

  it('handles custom base URL', () => {
    const customClient = { ...mockClient, baseUrl: 'https://custom.snyk.io' };
    const url = buildUrl(customClient, '/rest/orgs');

    expect(url).toContain('https://custom.snyk.io');
  });
});
