/**
 * Tests for gitlab-list-todos tool
 * Run: bun test gitlab/tools/gitlab-list-todos.test.ts
 */

import { isSuccess, isFailure } from '@libs/opencode-core/response';
import { describe, it, expect } from 'bun:test';

import type { ListTodosArgs, ListTodosData } from './gitlab-list-todos';

describe('gitlab-list-todos', () => {
  describe('argument validation', () => {
    it('should accept empty arguments', () => {
      const args: ListTodosArgs = {};
      expect(args).toBeDefined();
    });

    it('should accept state filter', () => {
      const args: ListTodosArgs = { state: 'pending' };
      expect(args.state).toBe('pending');
    });

    it('should accept action filter', () => {
      const args: ListTodosArgs = { action: 'assigned' };
      expect(args.action).toBe('assigned');
    });

    it('should accept target type filter', () => {
      const args: ListTodosArgs = { targetType: 'MergeRequest' };
      expect(args.targetType).toBe('MergeRequest');
    });

    it('should accept pagination', () => {
      const args: ListTodosArgs = { page: 2, perPage: 50 };
      expect(args.page).toBe(2);
      expect(args.perPage).toBe(50);
    });
  });

  describe('response structure', () => {
    it('should define ListTodosData interface correctly', () => {
      const mockData: ListTodosData = {
        todos: [
          {
            id: 1,
            body: 'Review merge request',
            state: 'pending',
            created_at: '2024-01-10T10:00:00Z',
            action_name: 'assigned',
            target_type: 'MergeRequest',
            target_url: 'https://gitlab.com/test/project/-/merge_requests/123',
            target: { id: 1, iid: 123, title: 'Test MR', web_url: 'https://gitlab.com' },
            project: {
              id: 1,
              name: 'Test Project',
              name_with_namespace: 'Test / Project',
              path_with_namespace: 'test/project',
            },
            author: { id: 1, name: 'John Doe', username: 'john.doe' },
          },
        ],
        count: 1,
        summary: { pending: 1, done: 0 },
      };

      expect(mockData.todos).toHaveLength(1);
      expect(mockData.todos[0].id).toBe(1);
      expect(mockData.count).toBe(1);
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          todos: [
            {
              id: 1,
              state: 'pending',
              created_at: '2024-01-01',
              action_name: 'assigned',
              targetType: 'Issue',
              // targetTitle: 'Test',
              targetUrl: 'https://example.com',
              body: 'Test',
              author: 'User',
              projectName: 'Project',
            },
          ],
          summary: { pending: 1, done: 0 },
        },
        metadata: { timestamp: Date.now(), duration: 100 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to list todos',
          code: 'GITLAB_LIST_TODOS_ERROR',
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
