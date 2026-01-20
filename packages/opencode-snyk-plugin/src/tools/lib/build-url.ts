/**
 * Build URL with version and pagination parameters
 */

import type { SnykClientConfig } from './create-client.ts';
import type { PaginationOptions } from './types.ts';

export const buildUrl = (client: SnykClientConfig, endpoint: string, pagination?: PaginationOptions): string => {
  const url = new URL(endpoint, client.baseUrl);

  if (!url.searchParams.has('version')) {
    url.searchParams.set('version', client.apiVersion);
  }

  if (pagination?.limit) {
    url.searchParams.set('limit', pagination.limit.toString());
  }
  if (pagination?.starting_after) {
    url.searchParams.set('starting_after', pagination.starting_after);
  }
  if (pagination?.ending_before) {
    url.searchParams.set('ending_before', pagination.ending_before);
  }

  return url.toString();
};
