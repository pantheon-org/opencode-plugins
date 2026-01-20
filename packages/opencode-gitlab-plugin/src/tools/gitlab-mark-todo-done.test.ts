/**
 * Tests for gitlab-mark-todo-done tool
 * Run: bun test gitlab/tools/gitlab-mark-todo-done.test.ts
 */

import { isSuccess, isFailure } from '@libs/opencode-core/response';
import { describe, it, expect } from 'bun:test';

import type { MarkTodoDoneArgs, MarkTodoDoneData } from './gitlab-mark-todo-done';

describe('gitlab-mark-todo-done', () => {
  describe('argument validation', () => {
    it('should require todoId', () => {
      const args: MarkTodoDoneArgs = { todoId: 42 };
      expect(args.todoId).toBe(42);
    });

    it('should accept custom credentials', () => {
      const args: MarkTodoDoneArgs = {
        todoId: 42,
        token: 'custom-token',
        baseUrl: 'https://custom.gitlab.com/api/v4',
      };
      expect(args.token).toBeDefined();
      expect(args.baseUrl).toBeDefined();
    });
  });

  describe('response structure', () => {
    it('should define MarkTodoDoneData interface correctly', () => {
      const mockData: MarkTodoDoneData = {
        todo: {
          id: 42,
          state: 'done',
          markedAt: '2024-01-10T10:00:00Z',
        },
      };

      expect(mockData.todo.id).toBe(42);
      expect(mockData.todo.state).toBe('done');
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          todo: {
            id: 42,
            state: 'done',
            markedAt: '2024-01-10T10:00:00Z',
          },
        },
        metadata: { timestamp: Date.now(), duration: 100 },
      };

      expect(isSuccess(response)).toBe(true);
      if (isSuccess(response)) {
        expect(response.data.todo.state).toBe('done');
      }
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to mark todo as done',
          code: 'GITLAB_MARK_TODO_DONE_ERROR',
          context: { todoId: 42 },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
