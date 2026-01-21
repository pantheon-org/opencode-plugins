/**
 * Tests for list-todos
 */

import { describe, it, expect, mock } from 'bun:test';

import { listTodos } from './list-todos.ts';

describe('listTodos', () => {
  const mockConfig = { token: 'test-token' };

  it('should list todos', async () => {
    const mockTodos = [{ id: 1, body: 'Review MR' }];

    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockTodos,
    })) as any;

    const result = await listTodos(mockConfig as any);

    expect(result).toEqual(mockTodos as any);
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

    await listTodos(mockConfig, {
      state: 'pending',
      action: 'assigned',
      targetType: 'MergeRequest',
      projectId: 123,
      authorId: 456,
      perPage: 10,
      page: 2,
    });

    expect(capturedUrl).toContain('state=pending');
    expect(capturedUrl).toContain('action=assigned');
    expect(capturedUrl).toContain('type=MergeRequest');
    expect(capturedUrl).toContain('project_id=123');
  });
});
