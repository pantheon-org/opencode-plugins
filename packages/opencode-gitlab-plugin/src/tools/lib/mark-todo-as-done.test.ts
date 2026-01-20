/**
 * Tests for mark-todo-as-done
 */

import { describe, it, expect, mock } from 'bun:test';
import { markTodoAsDone } from './mark-todo-as-done.ts';

describe('markTodoAsDone', () => {
  const mockConfig = { token: 'test-token' };

  it('should mark todo as done', async () => {
    const mockTodo = { id: 42, state: 'done' };

    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockTodo,
    })) as any;

    const result = await markTodoAsDone(mockConfig, 42);

    expect(result).toEqual(mockTodo);
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

    await markTodoAsDone(mockConfig, 123);

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

    await markTodoAsDone(mockConfig, 123);

    expect(capturedUrl).toContain('/todos/123/mark_as_done');
  });
});
