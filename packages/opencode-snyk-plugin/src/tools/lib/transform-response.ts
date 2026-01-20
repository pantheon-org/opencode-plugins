/**
 * Transform JSON:API response to simple paginated format
 */

import type { JsonApiResponse, PaginatedResponse } from './types.ts';

export const transformJsonApiResponse = <T>(response: JsonApiResponse<T>): PaginatedResponse<T & { id: string }> => {
  const resources = Array.isArray(response.data) ? response.data : [response.data];

  const data = resources.map((resource) => ({
    id: resource.id,
    ...resource.attributes,
  }));

  return {
    data,
    links: response.links,
    meta: response.meta,
  };
};
