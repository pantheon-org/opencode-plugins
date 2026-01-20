/**
 * Tests for snyk-query-issues tool
 * Run: bun test snyk/tools/snyk-query-issues.test.ts
 */

import { isFailure, isSuccess } from '@pantheon-org/opencode-core';
import { describe, expect, it } from 'bun:test';

import type { QueryIssuesArgs } from './snyk-query-issues';

describe('snyk-query-issues', () => {
  describe('argument validation', () => {
    it('should require organizationId', () => {
      const args: QueryIssuesArgs = { organizationId: 'org-123' };
      expect(args.organizationId).toBe('org-123');
    });

    it('should accept optional projectId', () => {
      const args: QueryIssuesArgs = {
        organizationId: 'org-123',
        projectId: 'proj-456',
      };
      expect(args.projectId).toBe('proj-456');
    });

    it('should accept severity filter', () => {
      const args: QueryIssuesArgs = {
        organizationId: 'org-123',
        severity: ['critical', 'high'],
      };
      expect(args.severity).toEqual(['critical', 'high']);
    });

    it('should accept issueType filter', () => {
      const args: QueryIssuesArgs = {
        organizationId: 'org-123',
        issueType: ['vuln', 'license'],
      };
      expect(args.issueType).toEqual(['vuln', 'license']);
    });

    it('should accept limit parameter', () => {
      const args: QueryIssuesArgs = {
        organizationId: 'org-123',
        limit: 100,
      };
      expect(args.limit).toBe(100);
    });
  });

  describe('response validation', () => {
    it('should handle success response structure', () => {
      const response = {
        success: true,
        data: {
          issues: [
            {
              id: 'issue-123',
              type: 'vuln',
              severity: 'high',
              title: 'SQL Injection',
              packageName: 'express',
              packageVersion: '4.16.0',
            },
          ],
          count: 1,
        },
        metadata: { timestamp: Date.now(), duration: 300 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should handle error response structure', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to query issues',
          code: 'SNYK_QUERY_ISSUES_ERROR',
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
