/**
 * List TODOs for the authenticated user
 */

import type { GitLabClientConfig, GitLabTodo } from '../types.ts';

import { createClientConfig } from './create-client-config.ts';
import { request } from './request.ts';

export const listTodos = async (
  config: GitLabClientConfig,
  options?: {
    state?: 'pending' | 'done';
    action?:
      | 'assigned'
      | 'mentioned'
      | 'build_failed'
      | 'marked'
      | 'approval_required'
      | 'unmergeable'
      | 'directly_addressed';
    targetType?: 'Issue' | 'MergeRequest' | 'Commit' | 'Pipeline';
    projectId?: string | number;
    authorId?: string | number;
    perPage?: number;
    page?: number;
  },
): Promise<GitLabTodo[]> => {
  const clientConfig = createClientConfig(config);
  const params = new URLSearchParams();

  if (options?.state) {
    params.set('state', options.state);
  }

  if (options?.action) {
    params.set('action', options.action);
  }

  if (options?.targetType) {
    params.set('type', options.targetType);
  }

  if (options?.projectId) {
    params.set('project_id', options.projectId.toString());
  }

  if (options?.authorId) {
    params.set('author_id', options.authorId.toString());
  }

  if (options?.perPage) {
    params.set('per_page', options.perPage.toString());
  }

  if (options?.page) {
    params.set('page', options.page.toString());
  }

  const response = await request<GitLabTodo[]>(`/todos?${params}`, clientConfig, {
    method: 'GET',
  });
  return response.data;
};
