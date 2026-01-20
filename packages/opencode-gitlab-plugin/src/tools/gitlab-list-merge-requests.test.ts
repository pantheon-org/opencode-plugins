/**
 * Tests for gitlab-list-merge-requests tool
 * Run: bun test gitlab/tools/gitlab-list-merge-requests.test.ts
 */

import { isSuccess, isFailure } from '@libs/opencode-core/response';
import { describe, it, expect } from 'bun:test';

import type { ListMergeRequestsArgs, ListMergeRequestsData } from './gitlab-list-merge-requests';

describe('gitlab-list-merge-requests', () => {
  describe('argument validation', () => {
    it('should accept empty arguments', () => {
      const args: ListMergeRequestsArgs = {};
      expect(args).toBeDefined();
    });

    it('should accept project ID filter', () => {
      const args: ListMergeRequestsArgs = { projectId: 123 };
      expect(args.projectId).toBe(123);
    });

    it('should accept state filter', () => {
      const args: ListMergeRequestsArgs = { state: 'opened' };
      expect(args.state).toBe('opened');
    });

    it('should accept author filter', () => {
      const args: ListMergeRequestsArgs = { author: 'john.doe' };
      expect(args.author).toBe('john.doe');
    });

    it('should accept assignee filter', () => {
      const args: ListMergeRequestsArgs = { assignee: 'jane.smith' };
      expect(args.assignee).toBe('jane.smith');
    });

    it('should accept labels filter', () => {
      const args: ListMergeRequestsArgs = { labels: ['bug', 'urgent'] };
      expect(args.labels).toEqual(['bug', 'urgent']);
    });

    it('should accept branch filters', () => {
      const args: ListMergeRequestsArgs = {
        sourceBranch: 'feature/new',
        targetBranch: 'main',
      };
      expect(args.sourceBranch).toBe('feature/new');
      expect(args.targetBranch).toBe('main');
    });

    it('should accept pagination', () => {
      const args: ListMergeRequestsArgs = { page: 2, perPage: 50 };
      expect(args.page).toBe(2);
      expect(args.perPage).toBe(50);
    });
  });

  describe('response structure', () => {
    it('should define ListMergeRequestsData interface correctly', () => {
      const mockData: ListMergeRequestsData = {
        mergeRequests: [
          {
            id: 1,
            iid: 101,
            title: 'Add new feature',
            description: 'Description',
            state: 'opened',
            author: 'John Doe',
            assignee: 'Jane Smith',
            sourceBranch: 'feature/new',
            targetBranch: 'main',
            labels: ['feature', 'enhancement'],
            createdAt: '2024-01-01',
            updatedAt: '2024-01-10',
            url: 'https://gitlab.com/project/-/merge_requests/101',
            project: 'my-project',
          },
        ],
      };

      expect(mockData.mergeRequests).toHaveLength(1);
      expect(mockData.mergeRequests[0].state).toBe('opened');
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          mergeRequests: [
            {
              id: 1,
              iid: 101,
              title: 'Test MR',
              description: '',
              state: 'opened',
              author: 'User',
              assignee: null,
              sourceBranch: 'feature',
              targetBranch: 'main',
              labels: [],
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
              url: 'https://example.com',
              project: 'test-project',
            },
          ],
        },
        metadata: {
          timestamp: Date.now(),
          duration: 150,
        },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to list merge requests',
          code: 'GITLAB_LIST_MRS_ERROR',
          context: { projectId: 123 },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
