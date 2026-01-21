/**
 * Tests for gitlab-mark-all-todos-done tool
 * Run: bun test gitlab/tools/gitlab-mark-all-todos-done.test.ts
 */

import { isSuccess, isFailure } from '@libs/opencode-core/response';
import { describe, it, expect } from 'bun:test';

import type { MarkAllTodosDoneArgs, MarkAllTodosDoneData } from './gitlab-mark-all-todos-done';

describe('gitlab-mark-all-todos-done', () => {
  describe('argument validation', () => {
    it('should accept empty arguments', () => {
      const args: MarkAllTodosDoneArgs = {};
      expect(args).toBeDefined();
    });

    it('should accept custom credentials', () => {
      const args: MarkAllTodosDoneArgs = {
        token: 'custom-token',
        baseUrl: 'https://custom.gitlab.com/api/v4',
      };
      expect(args.token).toBeDefined();
      expect(args.baseUrl).toBeDefined();
    });
  });

  describe('response structure', () => {
    it('should define MarkAllTodosDoneData interface correctly', () => {
      const mockData: MarkAllTodosDoneData = {
        completed: true,
      };

      expect(mockData.completed).toBe(true);
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          completed: true,
        },
        metadata: { timestamp: Date.now(), duration: 250 },
      };

      expect(isSuccess(response)).toBe(true);
      if (isSuccess(response)) {
        expect(response.data.completed).toBe(true);
      }
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to mark all todos as done',
          code: 'GITLAB_MARK_ALL_TODOS_DONE_ERROR',
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
