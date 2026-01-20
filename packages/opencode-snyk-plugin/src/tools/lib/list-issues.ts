/**
 * List issues for a project with optional filtering
 */

import type { SnykClientConfig } from './create-client.ts';
import { request } from './request.ts';
import { transformJsonApiResponse } from './transform-response.ts';
import type { FilterOptions, JsonApiResponse, PaginationOptions, SnykIssue } from './types.ts';

export const listIssues = async (
  client: SnykClientConfig,
  filters: FilterOptions,
  pagination?: PaginationOptions,
): Promise<SnykIssue[]> => {
  if (!filters.organizationId || !filters.projectId) {
    throw new Error('organizationId and projectId are required for listing issues');
  }

  const endpoint = `/rest/orgs/${filters.organizationId}/projects/${filters.projectId}/issues`;
  const response = await request<JsonApiResponse<SnykIssue>>(client, endpoint, {
    pagination,
  });
  const transformed = transformJsonApiResponse(response);
  return transformed.data;
};
