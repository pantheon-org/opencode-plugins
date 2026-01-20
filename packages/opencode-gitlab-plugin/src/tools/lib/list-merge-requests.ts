/**
 * List merge requests
 */

import type { GitLabClientConfig, GitLabMergeRequest } from '../types.ts';

import { createClientConfig } from './create-client-config.ts';
import { request } from './request.ts';

export const listMergeRequests = async (
  config: GitLabClientConfig,
  options?: {
    projectId?: string | number;
    state?: 'opened' | 'closed' | 'locked' | 'merged' | 'all';
    authorUsername?: string;
    assigneeUsername?: string;
    targetBranch?: string;
    sourceBranch?: string;
    labels?: string[];
    perPage?: number;
    page?: number;
  },
): Promise<GitLabMergeRequest[]> => {
  const clientConfig = createClientConfig(config);
  const params = new URLSearchParams();

  if (options?.state && options.state !== 'all') {
    params.set('state', options.state);
  }

  if (options?.authorUsername) {
    params.set('author_username', options.authorUsername);
  }

  if (options?.assigneeUsername) {
    params.set('assignee_username', options.assigneeUsername);
  }

  if (options?.targetBranch) {
    params.set('target_branch', options.targetBranch);
  }

  if (options?.sourceBranch) {
    params.set('source_branch', options.sourceBranch);
  }

  if (options?.labels && options.labels.length > 0) {
    params.set('labels', options.labels.join(','));
  }

  if (options?.perPage) {
    params.set('per_page', options.perPage.toString());
  }

  if (options?.page) {
    params.set('page', options.page.toString());
  }

  const endpoint = options?.projectId
    ? `/projects/${options.projectId}/merge_requests?${params}`
    : `/merge_requests?${params}`;

  const response = await request<GitLabMergeRequest[]>(endpoint, clientConfig, {
    method: 'GET',
  });
  return response.data;
};
