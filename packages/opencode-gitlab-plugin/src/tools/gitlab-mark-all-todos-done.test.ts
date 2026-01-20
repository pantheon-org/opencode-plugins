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
        success: true,
        count: 15,
        message: 'Marked 15 todos as done',
      };

      expect(mockData.success).toBe(true);
      expect(mockData.count).toBe(15);
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          success: true,
          count: 10,
          message: 'Marked 10 todos as done',
        },
        metadata: { timestamp: Date.now(), duration: 250 },
      };

      expect(isSuccess(response)).toBe(true);
      if (isSuccess(response)) {
        expect(response.data.count).toBe(10);
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
