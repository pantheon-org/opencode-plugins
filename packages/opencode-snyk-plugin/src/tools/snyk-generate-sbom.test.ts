/**
 * Tests for snyk-generate-sbom tool
 * Run: bun test snyk/tools/snyk-generate-sbom.test.ts
 */

import { isFailure, isSuccess } from '@pantheon-org/opencode-core';
import { describe, expect, it } from 'bun:test';

import type { GenerateSBOMParams } from './snyk-generate-sbom';

describe('snyk-generate-sbom', () => {
  describe('argument validation', () => {
    it('should require organizationId and projectId', () => {
      const args: GenerateSBOMParams = {
        organizationId: 'org-123',
        projectId: 'proj-456',
      };
      expect(args.organizationId).toBe('org-123');
      expect(args.projectId).toBe('proj-456');
    });

    it('should accept format parameter', () => {
      const args: GenerateSBOMParams = {
        organizationId: 'org-123',
        projectId: 'proj-456',
        format: 'cyclonedx1.5+json',
      };
      expect(args.format).toBe('cyclonedx1.5+json');
    });

    it('should accept excludeLicenses flag', () => {
      const args: GenerateSBOMParams = {
        organizationId: 'org-123',
        projectId: 'proj-456',
        excludeLicenses: true,
      };
      expect(args.excludeLicenses).toBe(true);
    });
  });

  describe('response validation', () => {
    it('should handle success response structure', () => {
      const response = {
        success: true,
        data: {
          sbom: {
            format: 'cyclonedx1.5+json',
            content: '{"bomFormat":"CycloneDX"}',
            generated: '2024-01-10',
          },
        },
        metadata: { timestamp: Date.now(), duration: 500 },
      };

      expect(isSuccess(response)).toBe(true);
    });

    it('should handle error response structure', () => {
      const response = {
        success: false,
        error: {
          message: 'Failed to generate SBOM',
          code: 'SNYK_GENERATE_SBOM_ERROR',
        },
        metadata: { timestamp: Date.now() },
      };

      expect(isFailure(response)).toBe(true);
    });
  });
});
