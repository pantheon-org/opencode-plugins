/**
 * Tests for mark-all-todos-as-done
 */

import { describe, it, expect, mock } from 'bun:test';
import { markAllTodosAsDone } from './mark-all-todos-as-done.ts';

describe('markAllTodosAsDone', () => {
  const mockConfig = { token: 'test-token' };

  it('should mark all todos as done', async () => {
    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({}),
    })) as any;

    await expect(markAllTodosAsDone(mockConfig)).resolves.toBeUndefined();
  });

  it('should use POST method', async () => {
    let capturedMethod = '';
    global.fetch = mock(async (_url: any, options: any) => {
      capturedMethod = options.method;
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({}),
      };
    }) as any;

    await markAllTodosAsDone(mockConfig);

    expect(capturedMethod).toBe('POST');
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

    await markAllTodosAsDone(mockConfig);

    expect(capturedUrl).toContain('/todos/mark_as_done');
  });
});
