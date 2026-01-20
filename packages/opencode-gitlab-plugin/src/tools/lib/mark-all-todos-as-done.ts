/**
 * Mark all TODOs as done
 */

import type { GitLabClientConfig } from '../types.ts';

import { createClientConfig } from './create-client-config.ts';
import { request } from './request.ts';

export const markAllTodosAsDone = async (config: GitLabClientConfig): Promise<void> => {
  const clientConfig = createClientConfig(config);
  await request<void>('/todos/mark_as_done', clientConfig, {
    method: 'POST',
  });
};
