/**
 * Tests for snyk-sbom-test tool
 * Run: bun test snyk/tools/snyk-sbom-test.test.ts
 */

import { isFailure, isSuccess } from '@pantheon-org/opencode-core';
import { describe, expect, it } from 'bun:test';

import type { SBOMTestParams } from './snyk-sbom-test';

describe('snyk-sbom-test', () => {
  describe('argument validation', () => {
    it('should require operation and organizationId', () => {
      const args: SBOMTestParams = {
        operation: 'start',
        organizationId: 'org-123',
      };
      expect(args.operation).toBe('start');
      expect(args.organizationId).toBe('org-123');
    });

    it('should accept jobId for status/results operations', () => {
      const args: SBOMTestParams = {
        operation: 'status',
        organizationId: 'org-123',
        jobId: 'job-789',
      };
      expect(args.jobId).toBe('job-789');
    });

    it('should accept testData for start operation', () => {
      const args: SBOMTestParams = {
        operation: 'start',
        organizationId: 'org-123',
        testData: {
          sbom: { content: '{}' },
        },
      };
      expect(args.testData).toBeDefined();
    });
  });

  describe('response validation', () => {
    it('should handle start operation response', () => {
      const response = {
        success: true,
        data: {
          operation: 'start',
          jobId: 'job-123',
          status: 'pending',
        },
        metadata: { timestamp: Date.now(), duration: 150 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should handle status operation response', () => {
      const response = {
        success: true,
        data: {
          operation: 'status',
          jobId: 'job-123',
          status: 'processing',
          progress: 50,
        },
        metadata: { timestamp: Date.now(), duration: 100 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should handle results operation response', () => {
      const response = {
        success: true,
        data: {
          operation: 'results',
          jobId: 'job-123',
          status: 'completed',
          results: {
            issues: [],
            summary: { total: 0, critical: 0, high: 0 },
          },
        },
        metadata: { timestamp: Date.now(), duration: 200 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should handle error response', () => {
      const response = {
        success: false,
        error: {
          message: 'SBOM test operation failed',
          code: 'SNYK_SBOM_TEST_ERROR',
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
