/**
 * Tests for get-todo
 */

import { describe, it, expect, mock } from 'bun:test';

import { getTodo } from './get-todo.ts';

describe('getTodo', () => {
  const mockConfig = { token: 'test-token' };

  it('should fetch todo by ID', async () => {
    const mockTodo = { id: 42, body: 'Review code' };

    global.fetch = mock(async () => ({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockTodo,
    })) as any;

    const result = await getTodo(mockConfig, 42);

    expect(result).toEqual(mockTodo as any);
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

    await getTodo(mockConfig, 123);

    expect(capturedUrl).toContain('/todos/123');
  });
});
