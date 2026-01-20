/**
 * Get projects for a specific organization
 */

import type { SnykClientConfig } from './create-client.ts';
import { request } from './request.ts';
import { transformJsonApiResponse } from './transform-response.ts';
import type { JsonApiResponse, PaginationOptions, SnykProject } from './types.ts';

export const getProjects = async (
  client: SnykClientConfig,
  organizationId: string,
  pagination?: PaginationOptions,
): Promise<SnykProject[]> => {
  const response = await request<JsonApiResponse<SnykProject>>(client, `/rest/orgs/${organizationId}/projects`, {
    pagination,
  });
  const transformed = transformJsonApiResponse(response);
  return transformed.data;
};
