/**
 * Get all organizations accessible to the authenticated user
 */

import type { SnykClientConfig } from './create-client.ts';
import { request } from './request.ts';
import { transformJsonApiResponse } from './transform-response.ts';
import type { JsonApiResponse, PaginationOptions, SnykOrganization } from './types.ts';

export const getOrganizations = async (
  client: SnykClientConfig,
  pagination?: PaginationOptions,
): Promise<SnykOrganization[]> => {
  const response = await request<JsonApiResponse<SnykOrganization>>(client, '/rest/orgs', {
    pagination,
  });
  const transformed = transformJsonApiResponse(response);
  return transformed.data;
};
