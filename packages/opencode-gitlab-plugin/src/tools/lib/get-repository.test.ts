/**
 * Tests for get-repository
 */

import { describe, it, expect, mock } from 'bun:test';

import { getRepository } from './get-repository.ts';

describe('getRepository', () => {
  const mockConfig = { token: 'test-token' };

  it('should fetch repository by ID', async () => {
    const mockRepo = { id: 123, name: 'my-repo' };

    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockRepo,
    })) as any;

    const result = await getRepository(mockConfig, 123);

    expect(result).toEqual(mockRepo as any);
  });

  it('should construct correct endpoint with string ID', async () => {
    let capturedUrl = '';
    global.fetch = mock(async (url: any) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ id: 'group/project' }),
      };
    }) as any;

    await getRepository(mockConfig, 'group/project');

    expect(capturedUrl).toContain('/projects/group/project');
  });
});
