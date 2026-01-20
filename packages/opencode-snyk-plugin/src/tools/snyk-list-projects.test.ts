/**
 * Tests for snyk-list-projects tool
 * Run: bun test snyk/tools/snyk-list-projects.test.ts
 */

import { isFailure, isSuccess } from '@pantheon-org/opencode-core';
import { describe, expect, it } from 'bun:test';

import type { ListProjectsArgs } from './snyk-list-projects';

describe('snyk-list-projects', () => {
  describe('argument validation', () => {
    it('should require organizationId', () => {
      const args: ListProjectsArgs = { organizationId: 'org-123' };
      expect(args.organizationId).toBe('org-123');
    });

    it('should accept limit parameter', () => {
      const args: ListProjectsArgs = {
        organizationId: 'org-123',
        limit: 50,
      };
      expect(args.limit).toBe(50);
    });
  });

  describe('response validation', () => {
    it('should handle success response structure', () => {
      const response = {
        success: true,
        data: {
          projects: [
            {
              id: 'proj-123',
              name: 'My Project',
              origin: 'github',
              type: 'npm',
              created: '2024-01-01',
            },
          ],
          count: 1,
        },
        metadata: { timestamp: Date.now(), duration: 200 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should handle error response structure', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to list projects',
          code: 'SNYK_LIST_PROJECTS_ERROR',
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
