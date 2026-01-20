/**
 * Tests for jira-get-project tool
 * Run: bun test jira/tools/jira-get-project.test.ts
 */

import { describe, it, expect } from 'bun:test';

import { isSuccess, isFailure } from '../../shared/lib/response';

import type { GetProjectArgs, GetProjectData } from './jira-get-project';

describe('jira-get-project', () => {
  describe('argument validation', () => {
    it('should require projectKey', () => {
      const args: GetProjectArgs = { projectKey: 'PROJ' };
      expect(args.projectKey).toBe('PROJ');
    });

    it('should accept custom credentials', () => {
      const args: GetProjectArgs = {
        projectKey: 'PROJ',
        baseUrl: 'https://custom.atlassian.net',
        email: 'user@example.com',
        apiToken: 'token',
      };
      expect(args.baseUrl).toBeDefined();
    });
  });

  describe('response structure', () => {
    it('should define GetProjectData interface correctly', () => {
      const mockData: GetProjectData = {
        project: {
          id: '10001',
          key: 'PROJ',
          name: 'My Project',
          description: 'Detailed project description',
          lead: 'John Doe',
          type: 'software',
          url: 'https://example.atlassian.net/rest/api/3/project/PROJ',
          archived: false,
          style: 'next-gen',
        },
      };

      expect(mockData.project.key).toBe('PROJ');
      expect(mockData.project.archived).toBe(false);
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          project: {
            id: '10001',
            key: 'TEST',
            name: 'Test',
            description: '',
            lead: 'User',
            type: 'software',
            url: 'https://example.com',
            archived: false,
            style: 'classic',
          },
        },
        metadata: { timestamp: Date.now(), duration: 120 },
      };

      expect(isSuccess(response)).toBe(true);
      if (isSuccess(response)) {
        expect(response.data.project.key).toBe('TEST');
      }
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          message: 'Project not found',
          code: 'JIRA_GET_PROJECT_ERROR',
          context: { projectKey: 'NOTFOUND' },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
