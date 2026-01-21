/**
 * Tests for get-merge-request
 */

import { describe, it, expect, mock } from 'bun:test';

import { getMergeRequest } from './get-merge-request.ts';

describe('getMergeRequest', () => {
  const mockConfig = { token: 'test-token' };

  it('should fetch merge request by project ID and IID', async () => {
    const mockMR = { id: 1, iid: 42, title: 'Test MR' };

    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockMR,
    })) as any;

    const result = await getMergeRequest(mockConfig, 123, 42);

    expect(result).toEqual(mockMR as any);
  });

  it('should construct correct endpoint', async () => {
    let capturedUrl = '';
    global.fetch = mock(async (url: any) => {
      capturedUrl = url;
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
    }) as any;

    await getMergeRequest(mockConfig, 'group/project', 99);

    expect(capturedUrl).toContain('/projects/group/project/merge_requests/99');
  });
});
