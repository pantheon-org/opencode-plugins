/**
 * SBOM test operations (start, status, results)
 */

import type { SnykClientConfig } from './create-client.ts';
import { request } from './request.ts';
import { transformJsonApiResponse } from './transform-response.ts';
import type { JsonApiResponse, SBOMTestJob, SBOMTestResult } from './types.ts';

export const startSBOMTest = async (
  client: SnykClientConfig,
  organizationId: string,
  testData: Record<string, unknown>,
): Promise<SBOMTestJob> => {
  const endpoint = `/rest/orgs/${organizationId}/sbom_tests`;
  const response = await request<JsonApiResponse<SBOMTestJob>>(client, endpoint, {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'sbom_test',
        attributes: testData,
      },
    }),
  });

  const transformed = transformJsonApiResponse(response);
  return transformed.data[0];
};

export const getSBOMTestStatus = async (
  client: SnykClientConfig,
  organizationId: string,
  jobId: string,
): Promise<SBOMTestJob> => {
  const endpoint = `/rest/orgs/${organizationId}/sbom_tests/${jobId}`;
  const response = await request<JsonApiResponse<SBOMTestJob>>(client, endpoint);
  const transformed = transformJsonApiResponse(response);
  return transformed.data[0];
};

export const getSBOMTestResults = async (
  client: SnykClientConfig,
  organizationId: string,
  jobId: string,
): Promise<SBOMTestResult> => {
  const endpoint = `/rest/orgs/${organizationId}/sbom_tests/${jobId}/results`;
  const response = await request<JsonApiResponse<SBOMTestResult>>(client, endpoint);
  const transformed = transformJsonApiResponse(response);
  return transformed.data[0];
};
