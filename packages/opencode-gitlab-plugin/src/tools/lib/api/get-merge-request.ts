/**
 * Get a single merge request
 */

import type { GitLabClientConfig, GitLabMergeRequest } from '../types.ts';

import { createClientConfig } from './create-client-config.ts';
import { request } from './request.ts';

export const getMergeRequest = async (
  config: GitLabClientConfig,
  projectId: string | number,
  mergeRequestIid: number,
): Promise<GitLabMergeRequest> => {
  const clientConfig = createClientConfig(config);
  const response = await request<GitLabMergeRequest>(
    `/projects/${projectId}/merge_requests/${mergeRequestIid}`,
    clientConfig,
    {
      method: 'GET',
    },
  );
  return response.data;
};
