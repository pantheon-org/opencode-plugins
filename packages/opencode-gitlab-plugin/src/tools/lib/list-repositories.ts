/**
 * List repositories (projects)
 */

import { createClientConfig } from './create-client-config.ts';
import { request } from './request.ts';
import type { GitLabClientConfig, GitLabRepository } from './types.ts';

export const listRepositories = async (
  config: GitLabClientConfig,
  options?: {
    owned?: boolean;
    membership?: boolean;
    perPage?: number;
    page?: number;
    search?: string;
  },
): Promise<GitLabRepository[]> => {
  const clientConfig = createClientConfig(config);
  const params = new URLSearchParams();

  if (options?.owned) {
    params.set('owned', 'true');
  }

  if (options?.membership) {
    params.set('membership', 'true');
  }

  if (options?.perPage) {
    params.set('per_page', options.perPage.toString());
  }

  if (options?.page) {
    params.set('page', options.page.toString());
  }

  if (options?.search) {
    params.set('search', options.search);
  }

  const response = await request<GitLabRepository[]>(`/projects?${params}`, clientConfig, {
    method: 'GET',
  });
  return response.data;
};
