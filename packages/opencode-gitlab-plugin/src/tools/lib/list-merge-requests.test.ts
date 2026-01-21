/**
 * Tests for list-merge-requests
 */

import { describe, it, expect, mock } from 'bun:test';

import { listMergeRequests } from './list-merge-requests.ts';

describe('listMergeRequests', () => {
  const mockConfig = { token: 'test-token' };

  it('should list merge requests', async () => {
    const mockMRs = [{ id: 1, title: 'Test MR' }];

    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockMRs,
    })) as any;

    const result = await listMergeRequests(mockConfig as any);

    expect(result).toEqual(mockMRs as any);
  });

  it('should build query params with all options', async () => {
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

    await listMergeRequests(mockConfig, {
      projectId: 123,
      state: 'opened',
      authorUsername: 'user1',
      assigneeUsername: 'user2',
      targetBranch: 'main',
      sourceBranch: 'feature',
      labels: ['bug', 'urgent'],
      perPage: 20,
      page: 1,
    });

    expect(capturedUrl).toContain('/projects/123/merge_requests');
    expect(capturedUrl).toContain('state=opened');
    expect(capturedUrl).toContain('author_username=user1');
    expect(capturedUrl).toContain('labels=bug,urgent');
  });
});
