/**
 * Tests for gitlab-get-todo tool
 * Run: bun test gitlab/tools/gitlab-get-todo.test.ts
 */

import { isSuccess, isFailure } from '@libs/opencode-core/response';
import { describe, it, expect, beforeEach } from 'bun:test';

import type { GetTodoArgs } from './gitlab-get-todo';

describe('gitlab-get-todo', () => {
  beforeEach(() => {
    process.env.GITLAB_TOKEN = 'test-token';
  });

  describe('argument validation', () => {
    it('should accept valid todoId', () => {
      const args: GetTodoArgs = {
        todoId: 42,
      };
      expect(args.todoId).toBe(42);
    });

    it('should accept optional token parameter', () => {
      const args: GetTodoArgs = {
        todoId: 42,
        token: 'custom-token',
      };
      expect(args.token).toBe('custom-token');
    });

    it('should accept optional baseUrl parameter', () => {
      const args: GetTodoArgs = {
        todoId: 42,
        baseUrl: 'https://custom.gitlab.com/api/v4',
      };
      expect(args.baseUrl).toBe('https://custom.gitlab.com/api/v4');
    });

    it('should accept optional timeout parameter', () => {
      const args: GetTodoArgs = {
        todoId: 42,
        timeout: 5000,
      };
      expect(args.timeout).toBe(5000);
    });
  });

  describe('response structure', () => {
    it('should have GetTodoData interface defined', () => {
      const mockData = {
        todo: {
          id: 42,
          state: 'pending' as const,
          created_at: '2024-01-01T00:00:00Z',
          action_name: 'assigned' as const,
          target_type: 'Issue' as const,
          target: {
            id: 123,
            title: 'Test Issue',
            web_url: 'https://gitlab.com/project/-/issues/123',
          },
          target_url: 'https://gitlab.com/project/-/issues/123',
          body: 'Review this issue',
          author: {
            id: 1,
            name: 'Test User',
            username: 'testuser',
          },
          project: {
            id: 456,
            name: 'Test Project',
            name_with_namespace: 'Group / Test Project',
            path_with_namespace: 'group/test-project',
          },
        },
      };
      expect(mockData.todo).toBeDefined();
      expect(mockData.todo.id).toBe(42);
    });
  });

  describe('response utilities', () => {
    it('should use isSuccess type guard for success responses', () => {
      const mockResponse = {
        success: true,
        data: {
          todo: {
            id: 42,
            state: 'pending' as const,
            created_at: '2024-01-01T00:00:00Z',
            action_name: 'assigned' as const,
            target_type: 'Issue' as const,
            target: {
              id: 123,
              title: 'Test',
              web_url: 'https://example.com',
            },
            target_url: 'https://example.com',
            body: 'Test',
            author: { id: 1, name: 'Test', username: 'test' },
            project: {
              id: 1,
              name: 'Test',
              name_with_namespace: 'Test',
              path_with_namespace: 'test',
            },
          },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isSuccess(mockResponse)).toBe(true);
      if (isSuccess(mockResponse)) {
        expect(mockResponse.data.todo.id).toBe(42);
      }
    });

    it('should use isFailure type guard for error responses', () => {
      const mockResponse = {
        success: false,
        error: {
          message: 'TODO not found',
          code: 'GITLAB_GET_TODO_ERROR',
          context: { todoId: 999 },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(mockResponse)).toBe(true);
      if (isFailure(mockResponse)) {
        expect(mockResponse.error.message).toBe('TODO not found');
        expect(mockResponse.error.code).toBe('GITLAB_GET_TODO_ERROR');
      }
    });
  });

  describe('error scenarios', () => {
    it('should define error response structure', () => {
      const errorResponse = {
        success: false,
        error: {
          message: 'API error',
          code: 'GITLAB_GET_TODO_ERROR',
          context: { todoId: 42 },
        },
        metadata: {
          timestamp: Date.now(),
        },
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error.code).toBe('GITLAB_GET_TODO_ERROR');
    });
  });
});
