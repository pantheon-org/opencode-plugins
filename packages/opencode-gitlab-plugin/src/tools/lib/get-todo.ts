/**
 * Get a single TODO by ID
 */

import type { GitLabClientConfig, GitLabTodo } from '../types.ts';

import { createClientConfig } from './create-client-config.ts';
import { request } from './request.ts';

export const getTodo = async (config: GitLabClientConfig, todoId: number): Promise<GitLabTodo> => {
  const clientConfig = createClientConfig(config);
  const response = await request<GitLabTodo>(`/todos/${todoId}`, clientConfig, {
    method: 'GET',
  });
  return response.data;
};
