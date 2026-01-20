/**
 * Tests for jira-search-issues tool
 * Run: bun test jira/tools/jira-search-issues.test.ts
 */

import { describe, it, expect } from 'bun:test';

import { isSuccess, isFailure } from '../../shared/lib/response';

import type { SearchIssuesArgs, SearchIssuesData } from './jira-search-issues';

describe('jira-search-issues', () => {
  describe('argument validation', () => {
    it('should accept empty arguments', () => {
      const args: SearchIssuesArgs = {};
      expect(args).toBeDefined();
    });

    it('should accept project filter', () => {
      const args: SearchIssuesArgs = { project: 'PROJ' };
      expect(args.project).toBe('PROJ');
    });

    it('should accept status filter', () => {
      const args: SearchIssuesArgs = { status: 'In Progress' };
      expect(args.status).toBe('In Progress');
    });

    it('should accept assignee filter', () => {
      const args: SearchIssuesArgs = { assignee: 'john.doe' };
      expect(args.assignee).toBe('john.doe');
    });

    it('should accept multiple filters', () => {
      const args: SearchIssuesArgs = {
        project: 'PROJ',
        status: 'Open',
        issueType: 'Bug',
        priority: 'High',
      };
      expect(args.project).toBe('PROJ');
      expect(args.status).toBe('Open');
      expect(args.issueType).toBe('Bug');
      expect(args.priority).toBe('High');
    });

    it('should accept mine flag', () => {
      const args: SearchIssuesArgs = { mine: true };
      expect(args.mine).toBe(true);
    });

    it('should accept maxResults', () => {
      const args: SearchIssuesArgs = { maxResults: 100 };
      expect(args.maxResults).toBe(100);
    });

    it('should accept custom credentials', () => {
      const args: SearchIssuesArgs = {
        baseUrl: 'https://custom.atlassian.net',
        email: 'user@example.com',
        apiToken: 'token',
      };
      expect(args.baseUrl).toBeDefined();
      expect(args.email).toBeDefined();
      expect(args.apiToken).toBeDefined();
    });
  });

  describe('response structure', () => {
    it('should define SearchIssuesData interface correctly', () => {
      const mockData: SearchIssuesData = {
        total: 5,
        startAt: 0,
        maxResults: 50,
        jql: 'project = "PROJ" AND status = "Open"',
        issues: [
          {
            key: 'PROJ-123',
            summary: 'Test issue',
            status: 'Open',
            assignee: 'John Doe',
            reporter: 'Jane Smith',
            priority: 'High',
            type: 'Bug',
            project: 'PROJ',
            created: '2024-01-01',
            updated: '2024-01-10',
            url: 'https://example.atlassian.net/rest/api/3/issue/PROJ-123',
          },
        ],
      };

      expect(mockData.issues).toHaveLength(1);
      expect(mockData.total).toBe(5);
      expect(mockData.jql).toContain('project');
    });

    it('should handle empty results', () => {
      const mockData: SearchIssuesData = {
        total: 0,
        startAt: 0,
        maxResults: 50,
        jql: 'project = "NONE"',
        issues: [],
      };

      expect(mockData.issues).toHaveLength(0);
      expect(mockData.total).toBe(0);
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          total: 1,
          startAt: 0,
          maxResults: 50,
          jql: 'status = "Open"',
          issues: [
            {
              key: 'TEST-1',
              summary: 'Test',
              status: 'Open',
              assignee: 'User',
              reporter: 'Reporter',
              priority: 'Medium',
              type: 'Task',
              project: 'TEST',
              created: '2024-01-01',
              updated: '2024-01-01',
              url: 'https://example.com',
            },
          ],
        },
        metadata: {
          timestamp: Date.now(),
          duration: 200,
        },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to search issues',
          code: 'JIRA_SEARCH_ISSUES_ERROR',
          context: { project: 'PROJ' },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
      if (isFailure(response)) {
        expect(response.error.code).toBe('JIRA_SEARCH_ISSUES_ERROR');
      }
    });
  });
});
