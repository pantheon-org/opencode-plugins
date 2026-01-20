/**
 * Tests for gitlab-list-repos tool
 * Run: bun test gitlab/tools/gitlab-list-repos.test.ts
 */

import { isSuccess, isFailure } from '@libs/opencode-core/response';
import { describe, it, expect } from 'bun:test';

import type { ListReposArgs, ListReposData } from './gitlab-list-repos';

describe('gitlab-list-repos', () => {
  describe('argument validation', () => {
    it('should accept empty arguments', () => {
      const args: ListReposArgs = {};
      expect(args).toBeDefined();
    });

    it('should accept owned filter', () => {
      const args: ListReposArgs = { owned: true };
      expect(args.owned).toBe(true);
    });

    it('should accept membership filter', () => {
      const args: ListReposArgs = { membership: true };
      expect(args.membership).toBe(true);
    });

    it('should accept search parameter', () => {
      const args: ListReposArgs = { search: 'my-project' };
      expect(args.search).toBe('my-project');
    });

    it('should accept pagination parameters', () => {
      const args: ListReposArgs = { page: 2, perPage: 50 };
      expect(args.page).toBe(2);
      expect(args.perPage).toBe(50);
    });

    it('should accept custom baseUrl and token', () => {
      const args: ListReposArgs = {
        baseUrl: 'https://custom.gitlab.com/api/v4',
        token: 'custom-token',
      };
      expect(args.baseUrl).toBeDefined();
      expect(args.token).toBeDefined();
    });
  });

  describe('response structure', () => {
    it('should define ListReposData interface correctly', () => {
      const mockData: ListReposData = {
        repositories: [
          {
            id: 1,
            name: 'test-project',
            fullPath: 'user/test-project',
            description: 'Test repository',
            url: 'https://gitlab.com/user/test-project',
            namespace: 'user',
            defaultBranch: 'main',
            visibility: 'private',
            archived: false,
            fork: false,
            stars: 10,
            forks: 2,
            createdAt: '2024-01-01',
            lastActivity: '2024-01-10',
          },
        ],
      };

      expect(mockData.repositories).toHaveLength(1);
      expect(mockData.repositories[0].id).toBe(1);
      expect(mockData.repositories[0].visibility).toBe('private');
    });

    it('should handle empty repository list', () => {
      const mockData: ListReposData = {
        repositories: [],
      };

      expect(mockData.repositories).toHaveLength(0);
    });
  });

  describe('response validation', () => {
    it('should validate success response structure', () => {
      const response = {
        success: true,
        data: {
          repositories: [
            {
              id: 1,
              name: 'test',
              fullPath: 'user/test',
              description: '',
              url: 'https://gitlab.com/user/test',
              namespace: 'user',
              defaultBranch: 'main',
              visibility: 'public',
              archived: false,
              fork: false,
              stars: 0,
              forks: 0,
              createdAt: '2024-01-01',
              lastActivity: '2024-01-01',
            },
          ],
        },
        metadata: {
          timestamp: Date.now(),
          duration: 150,
          pagination: { page: 1, perPage: 20, total: 1 },
        },
      };

      expect(isSuccess(response)).toBe(true);
      if (isSuccess(response)) {
        expect(response.data.repositories).toBeDefined();
        expect(response.metadata.pagination).toBeDefined();
      }
    });

    it('should validate error response structure', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to list repositories',
          code: 'GITLAB_LIST_REPOS_ERROR',
          context: { owned: true, search: 'test' },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
      if (isFailure(response)) {
        expect(response.error.code).toBe('GITLAB_LIST_REPOS_ERROR');
        expect(response.error.context).toBeDefined();
      }
    });
  });
});
