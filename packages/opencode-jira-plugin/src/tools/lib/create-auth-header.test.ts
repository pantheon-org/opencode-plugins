/**
 * Tests for createAuthHeader
 * Run: bun test src/tools/lib/create-auth-header.test.ts
 */

import { describe, it, expect } from 'bun:test';

import { createAuthHeader } from './create-auth-header.ts';

describe('createAuthHeader', () => {
  it('should create Basic Auth header with email and token', () => {
    const header = createAuthHeader('user@example.com', 'secret-token');
    expect(header).toMatch(/^Basic /);
  });

  it('should encode credentials correctly', () => {
    const header = createAuthHeader('test@example.com', 'test-token');
    const base64Part = header.replace('Basic ', '');
    const decoded = atob(base64Part);
    expect(decoded).toBe('test@example.com:test-token');
  });

  it('should handle special characters in email', () => {
    const header = createAuthHeader('user+tag@example.com', 'token');
    expect(header).toMatch(/^Basic /);
    const base64Part = header.replace('Basic ', '');
    const decoded = atob(base64Part);
    expect(decoded).toBe('user+tag@example.com:token');
  });

  it('should handle special characters in token', () => {
    const header = createAuthHeader('user@example.com', 'token-with-special!@#$');
    expect(header).toMatch(/^Basic /);
    const base64Part = header.replace('Basic ', '');
    const decoded = atob(base64Part);
    expect(decoded).toBe('user@example.com:token-with-special!@#$');
  });

  it('should create different headers for different credentials', () => {
    const header1 = createAuthHeader('user1@example.com', 'token1');
    const header2 = createAuthHeader('user2@example.com', 'token2');
    expect(header1).not.toBe(header2);
  });
});
