/**
 * Mark a TODO as done
 */

import { createClientConfig } from './create-client-config.ts';
import { request } from './request.ts';
import type { GitLabClientConfig, GitLabTodo } from './types.ts';

export const markTodoAsDone = async (config: GitLabClientConfig, todoId: number): Promise<GitLabTodo> => {
  const clientConfig = createClientConfig(config);
  const response = await request<GitLabTodo>(`/todos/${todoId}/mark_as_done`, clientConfig, {
    method: 'POST',
  });
  return response.data;
};
