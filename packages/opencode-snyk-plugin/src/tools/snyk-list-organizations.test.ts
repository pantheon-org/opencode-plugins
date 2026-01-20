/**
 * Tests for snyk-list-organizations tool
 * Run: bun test snyk/tools/snyk-list-organizations.test.ts
 */

import { isFailure, isSuccess } from '@pantheon-org/opencode-core';
import { describe, expect, it } from 'bun:test';

import type { ListOrganizationsArgs, ListOrganizationsData } from './snyk-list-organizations';

describe('snyk-list-organizations', () => {
  describe('argument validation', () => {
    it('should accept empty arguments', () => {
      const args: ListOrganizationsArgs = {};
      expect(args).toBeDefined();
    });

    it('should accept limit parameter', () => {
      const args: ListOrganizationsArgs = { limit: 50 };
      expect(args.limit).toBe(50);
    });
  });

  describe('response structure', () => {
    it('should define ListOrganizationsData interface correctly', () => {
      const mockData: ListOrganizationsData = {
        organizations: [
          {
            id: 'org-123',
            name: 'My Organization',
            slug: 'my-org',
          },
          {
            id: 'org-456',
            name: 'Another Org',
            slug: 'another-org',
          },
        ],
        count: 2,
      };

      expect(mockData.organizations).toHaveLength(2);
      expect(mockData.count).toBe(2);
      expect(mockData.organizations[0].id).toBe('org-123');
    });

    it('should handle empty organization list', () => {
      const mockData: ListOrganizationsData = {
        organizations: [],
        count: 0,
      };

      expect(mockData.organizations).toHaveLength(0);
      expect(mockData.count).toBe(0);
    });
  });

  describe('response validation', () => {
    it('should validate success response structure', () => {
      const response = {
        success: true,
        data: {
          organizations: [
            {
              id: 'org-123',
              name: 'Test Org',
              slug: 'test-org',
            },
          ],
          count: 1,
        },
        metadata: {
          timestamp: Date.now(),
          duration: 150,
        },
      };

      expect(isSuccess(response)).toBe(true);
      if (isSuccess(response)) {
        expect(response.data.organizations).toBeDefined();
        expect(response.data.count).toBe(1);
      }
    });

    it('should validate error response structure', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to list organizations',
          code: 'SNYK_LIST_ORGS_ERROR',
          context: { limit: 100 },
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
      if (isFailure(response)) {
        expect(response.error.code).toBe('SNYK_LIST_ORGS_ERROR');
        expect(response.error.context).toBeDefined();
      }
    });
  });
});
