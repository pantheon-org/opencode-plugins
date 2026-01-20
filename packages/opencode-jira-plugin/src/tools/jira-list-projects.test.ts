/**
 * Tests for jira-list-projects tool
 * Run: bun test jira/tools/jira-list-projects.test.ts
 */

import { describe, it, expect } from 'bun:test';

import { isSuccess, isFailure } from '../../shared/lib/response';

import type { ListProjectsArgs, ListProjectsData } from './jira-list-projects';

describe('jira-list-projects', () => {
  describe('argument validation', () => {
    it('should accept empty arguments', () => {
      const args: ListProjectsArgs = {};
      expect(args).toBeDefined();
    });

    it('should accept search parameter', () => {
      const args: ListProjectsArgs = { search: 'my project' };
      expect(args.search).toBe('my project');
    });

    it('should accept maxResults', () => {
      const args: ListProjectsArgs = { maxResults: 100 };
      expect(args.maxResults).toBe(100);
    });

    it('should accept custom credentials', () => {
      const args: ListProjectsArgs = {
        baseUrl: 'https://custom.atlassian.net',
        email: 'user@example.com',
        apiToken: 'token',
      };
      expect(args.baseUrl).toBeDefined();
    });
  });

  describe('response structure', () => {
    it('should define ListProjectsData interface correctly', () => {
      const mockData: ListProjectsData = {
        projects: [
          {
            id: '10001',
            key: 'PROJ',
            name: 'My Project',
            description: 'Project description',
            lead: 'John Doe',
            type: 'software',
            url: 'https://example.atlassian.net/rest/api/3/project/PROJ',
          },
          {
            id: '10002',
            key: 'TEST',
            name: 'Test Project',
            description: '',
            lead: 'Jane Smith',
            type: 'business',
            url: 'https://example.atlassian.net/rest/api/3/project/TEST',
          },
        ],
        total: 2,
      };

      expect(mockData.projects).toHaveLength(2);
      expect(mockData.total).toBe(2);
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          projects: [
            {
              id: '10001',
              key: 'TEST',
              name: 'Test',
              description: '',
              lead: 'User',
              type: 'software',
              url: 'https://example.com',
            },
          ],
          total: 1,
        },
        metadata: { timestamp: Date.now(), duration: 150 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to list projects',
          code: 'JIRA_LIST_PROJECTS_ERROR',
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
