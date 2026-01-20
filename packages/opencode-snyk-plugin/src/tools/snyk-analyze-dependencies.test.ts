/**
 * Tests for snyk-analyze-dependencies tool
 * Run: bun test snyk/tools/snyk-analyze-dependencies.test.ts
 */

import { isFailure, isSuccess } from '@pantheon-org/opencode-core';
import { describe, expect, it } from 'bun:test';

import type { AnalyzeDependenciesParams } from './snyk-analyze-dependencies';

describe('snyk-analyze-dependencies', () => {
  describe('argument validation', () => {
    it('should require organizationId and projectId', () => {
      const args: AnalyzeDependenciesParams = {
        organizationId: 'org-123',
        projectId: 'proj-456',
      };
      expect(args.organizationId).toBe('org-123');
      expect(args.projectId).toBe('proj-456');
    });

    it('should accept minSeverity filter', () => {
      const args: AnalyzeDependenciesParams = {
        organizationId: 'org-123',
        projectId: 'proj-456',
        options: {
          minSeverity: 'high',
        },
      };
      expect(args.options?.minSeverity).toBe('high');
    });

    it('should accept pagination parameters', () => {
      const args: AnalyzeDependenciesParams = {
        organizationId: 'org-123',
        projectId: 'proj-456',
        options: {
          limit: 50,
          offset: 100,
        },
      };
      expect(args.options?.limit).toBe(50);
      expect(args.options?.offset).toBe(100);
    });
  });

  describe('response validation', () => {
    it('should handle success response structure', () => {
      const response = {
        success: true,
        data: {
          dependencies: [
            {
              packageName: 'express',
              packageVersion: '4.16.0',
              purl: 'pkg:npm/express@4.16.0',
              issues: [
                {
                  severity: 'high',
                  title: 'Security vulnerability',
                },
              ],
            },
          ],
          count: 1,
        },
        metadata: { timestamp: Date.now(), duration: 400 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should handle error response structure', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to analyze dependencies',
          code: 'SNYK_ANALYZE_DEPS_ERROR',
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
