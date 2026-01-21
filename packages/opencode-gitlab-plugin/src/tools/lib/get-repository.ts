/**
 * Get a single repository by ID
 */

import { createClientConfig } from './create-client-config.ts';
import { request } from './request.ts';
import type { GitLabClientConfig, GitLabRepository } from './types.ts';

export const getRepository = async (config: GitLabClientConfig, id: string | number): Promise<GitLabRepository> => {
  const clientConfig = createClientConfig(config);
  const response = await request<GitLabRepository>(`/projects/${id}`, clientConfig, {
    method: 'GET',
  });
  return response.data;
};
