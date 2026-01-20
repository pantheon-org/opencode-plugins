/**
 * Tests for create-client module
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { createClient, createClientFromEnv } from './create-client.ts';

describe('createClient', () => {
  it('creates client with provided token', () => {
    const client = createClient({ token: 'test-token' });

    expect(client.token).toBe('test-token');
    expect(client.baseUrl).toBe('https://api.snyk.io');
    expect(client.apiVersion).toBe('2023-06-22');
    expect(client.timeout).toBe(30000);
  });

  it('creates client with custom options', () => {
    const client = createClient({
      token: 'test-token',
      baseUrl: 'https://custom.snyk.io',
      apiVersion: '2024-01-01',
      timeout: 60000,
    });

    expect(client.token).toBe('test-token');
    expect(client.baseUrl).toBe('https://custom.snyk.io');
    expect(client.apiVersion).toBe('2024-01-01');
    expect(client.timeout).toBe(60000);
  });

  it('uses SNYK_TOKEN from environment if not provided', () => {
    const originalToken = process.env.SNYK_TOKEN;
    process.env.SNYK_TOKEN = 'env-token';

    try {
      const client = createClient();
      expect(client.token).toBe('env-token');
    } finally {
      if (originalToken) {
        process.env.SNYK_TOKEN = originalToken;
      } else {
        delete process.env.SNYK_TOKEN;
      }
    }
  });

  it('uses SNYK_API_URL from environment if baseUrl not provided', () => {
    const originalUrl = process.env.SNYK_API_URL;
    const originalToken = process.env.SNYK_TOKEN;

    process.env.SNYK_API_URL = 'https://env-custom.snyk.io';
    process.env.SNYK_TOKEN = 'test-token';

    try {
      const client = createClient();
      expect(client.baseUrl).toBe('https://env-custom.snyk.io');
    } finally {
      if (originalUrl) {
        process.env.SNYK_API_URL = originalUrl;
      } else {
        delete process.env.SNYK_API_URL;
      }
      if (originalToken) {
        process.env.SNYK_TOKEN = originalToken;
      } else {
        delete process.env.SNYK_TOKEN;
      }
    }
  });

  it('throws error if no token provided and SNYK_TOKEN not set', () => {
    const originalToken = process.env.SNYK_TOKEN;
    delete process.env.SNYK_TOKEN;

    try {
      expect(() => createClient()).toThrow('Snyk API token is required');
    } finally {
      if (originalToken) {
        process.env.SNYK_TOKEN = originalToken;
      }
    }
  });
});

describe('createClientFromEnv', () => {
  let originalToken: string | undefined;

  beforeEach(() => {
    originalToken = process.env.SNYK_TOKEN;
  });

  afterEach(() => {
    if (originalToken) {
      process.env.SNYK_TOKEN = originalToken;
    } else {
      delete process.env.SNYK_TOKEN;
    }
  });

  it('creates client from SNYK_TOKEN environment variable', () => {
    process.env.SNYK_TOKEN = 'env-token';

    const client = createClientFromEnv();

    expect(client.token).toBe('env-token');
    expect(client.baseUrl).toBe('https://api.snyk.io');
  });

  it('uses SNYK_API_URL from environment if set', () => {
    const originalUrl = process.env.SNYK_API_URL;
    process.env.SNYK_TOKEN = 'env-token';
    process.env.SNYK_API_URL = 'https://custom-env.snyk.io';

    try {
      const client = createClientFromEnv();
      expect(client.baseUrl).toBe('https://custom-env.snyk.io');
    } finally {
      if (originalUrl) {
        process.env.SNYK_API_URL = originalUrl;
      } else {
        delete process.env.SNYK_API_URL;
      }
    }
  });

  it('throws error if SNYK_TOKEN not set', () => {
    delete process.env.SNYK_TOKEN;

    expect(() => createClientFromEnv()).toThrow('SNYK_TOKEN environment variable is required');
  });
});
