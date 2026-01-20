/**
 * Manage SBOM test operations (async SBOM generation)
 * Tool: snyk-sbom-test
 */

import { failure, measureDuration, type PluginToolResponse, success } from '@pantheon-org/opencode-core';
import { createToolLogger, logOperationTiming } from '@pantheon-org/opencode-core';

import { createClient, getSBOMTestResults, getSBOMTestStatus, startSBOMTest } from './lib/index.ts';
import type { SBOMTestJob, SBOMTestResult } from './lib/index.ts';

const log = createToolLogger('snyk', 'sbom-test');

type SBOMTestOperation = 'start' | 'status' | 'results';

export interface SBOMTestParams {
  operation: SBOMTestOperation;
  organizationId: string;
  jobId?: string;
  testData?: Record<string, unknown>;
  token?: string;
  baseUrl?: string;
  timeout?: number;
}

type SBOMTestData = {
  operation: SBOMTestOperation;
  organizationId: string;
} & (
  | { operation: 'start'; job: SBOMTestJob }
  | { operation: 'status'; job: SBOMTestJob }
  | { operation: 'results'; result: SBOMTestResult }
);

/**
 * Manage SBOM test operations for async SBOM generation
 */
export const sbomTest = async (params: SBOMTestParams): Promise<PluginToolResponse<SBOMTestData>> => {
  log.info('SBOM test operation', {
    operation: params.operation,
    organizationId: params.organizationId,
    jobId: params.jobId,
  });

  try {
    const client = createClient({
      token: params.token,
      baseUrl: params.baseUrl,
      timeout: params.timeout,
    });

    const [result, duration] = await measureDuration(async () => {
      switch (params.operation) {
        case 'start': {
          if (!params.testData) {
            throw new Error('testData is required for start operation');
          }
          const job = await startSBOMTest(client, params.organizationId, params.testData);
          return {
            operation: 'start' as const,
            organizationId: params.organizationId,
            job,
          };
        }

        case 'status': {
          if (!params.jobId) {
            throw new Error('jobId is required for status operation');
          }
          const job = await getSBOMTestStatus(client, params.organizationId, params.jobId);
          return {
            operation: 'status' as const,
            organizationId: params.organizationId,
            job,
          };
        }

        case 'results': {
          if (!params.jobId) {
            throw new Error('jobId is required for results operation');
          }
          const result = await getSBOMTestResults(client, params.organizationId, params.jobId);
          return {
            operation: 'results' as const,
            organizationId: params.organizationId,
            result,
          };
        }

        default:
          throw new Error(`Invalid operation: ${params.operation}`);
      }
    });

    logOperationTiming(log, `sbom-test-${params.operation}`, duration);

    log.info('SBOM test operation complete', {
      operation: params.operation,
      duration,
    });

    return success(result, { duration });
  } catch (error) {
    log.error('SBOM test operation failed', {
      error: error instanceof Error ? error.message : String(error),
      operation: params.operation,
      organizationId: params.organizationId,
    });

    return failure(error instanceof Error ? error.message : 'SBOM test operation failed', {
      code: 'SNYK_SBOM_TEST_ERROR',
      context: {
        operation: params.operation,
        organizationId: params.organizationId,
        jobId: params.jobId,
      },
    });
  }
};

export default sbomTest;
