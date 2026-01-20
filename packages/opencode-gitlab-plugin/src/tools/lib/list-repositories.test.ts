/**
 * Tests for list-repositories
 */

import { describe, it, expect, mock } from 'bun:test';
import { listRepositories } from './list-repositories.ts';

describe('listRepositories', () => {
  const mockConfig = { token: 'test-token' };

  it('should call request with correct endpoint', async () => {
    const mockRepositories = [{ id: 1, name: 'repo1' }];

    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockRepositories,
    })) as any;

    const result = await listRepositories(mockConfig);

    expect(result).toEqual(mockRepositories);
  });

  it('should build query params correctly', async () => {
    let capturedUrl = '';
    global.fetch = mock(async (url: any) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => [],
      };
    }) as any;

    await listRepositories(mockConfig, {
      owned: true,
      membership: true,
      perPage: 10,
      page: 2,
      search: 'test',
    });

    expect(capturedUrl).toContain('owned=true');
    expect(capturedUrl).toContain('membership=true');
    expect(capturedUrl).toContain('per_page=10');
    expect(capturedUrl).toContain('page=2');
    expect(capturedUrl).toContain('search=test');
  });
});
