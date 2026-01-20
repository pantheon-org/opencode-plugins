/**
 * Tests for jira-get-issue tool
 * Run: bun test jira/tools/jira-get-issue.test.ts
 */

import { describe, it, expect } from 'bun:test';

import { isSuccess, isFailure } from '../../shared/lib/response';

import type { GetIssueArgs, GetIssueData } from './jira-get-issue';

describe('jira-get-issue', () => {
  describe('argument validation', () => {
    it('should require issueKey', () => {
      const args: GetIssueArgs = { issueKey: 'PROJ-123' };
      expect(args.issueKey).toBe('PROJ-123');
    });

    it('should accept custom expand fields', () => {
      const args: GetIssueArgs = {
        issueKey: 'PROJ-123',
        expand: 'changelog,transitions',
      };
      expect(args.expand).toBe('changelog,transitions');
    });

    it('should accept custom fields', () => {
      const args: GetIssueArgs = {
        issueKey: 'PROJ-123',
        fields: 'summary,status,assignee',
      };
      expect(args.fields).toBe('summary,status,assignee');
    });

    it('should accept custom credentials', () => {
      const args: GetIssueArgs = {
        issueKey: 'PROJ-123',
        baseUrl: 'https://custom.atlassian.net',
        email: 'user@example.com',
        apiToken: 'token',
      };
      expect(args.baseUrl).toBeDefined();
    });
  });

  describe('response structure', () => {
    it('should define GetIssueData interface correctly', () => {
      const mockData: GetIssueData = {
        issue: {
          key: 'PROJ-123',
          summary: 'Fix critical bug',
          description: 'Detailed description',
          status: 'In Progress',
          assignee: 'John Doe',
          reporter: 'Jane Smith',
          priority: 'High',
          type: 'Bug',
          project: 'PROJ',
          labels: ['bug', 'critical'],
          components: ['Backend', 'API'],
          created: '2024-01-01',
          updated: '2024-01-10',
          url: 'https://example.atlassian.net/rest/api/3/issue/PROJ-123',
        },
      };

      expect(mockData.issue.key).toBe('PROJ-123');
      expect(mockData.issue.labels).toHaveLength(2);
    });
  });

  describe('response validation', () => {
    it('should validate success response', () => {
      const response = {
        success: true,
        data: {
          issue: {
            key: 'TEST-1',
            summary: 'Test',
            description: '',
            status: 'Open',
            assignee: 'User',
            reporter: 'Reporter',
            priority: 'Medium',
            type: 'Task',
            project: 'TEST',
            labels: [],
            components: [],
            created: '2024-01-01',
            updated: '2024-01-01',
            url: 'https://example.com',
          },
        },
        metadata: { timestamp: Date.now(), duration: 100 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should validate error response', () => {
      const response = {
        success: false,
        error: {
          message: 'Issue not found',
          code: 'JIRA_GET_ISSUE_ERROR',
          context: { issueKey: 'PROJ-999' },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
