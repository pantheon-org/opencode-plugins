/**
 * Create a GitLab API client configuration
 */

import type { GitLabClientConfig } from '../types.ts';

export const createClientConfig = (config: GitLabClientConfig = {}): Required<GitLabClientConfig> => {
  const baseUrl = (
    config.baseUrl ||
    process.env.GITLAB_API_URL ||
    process.env.GITLAB_URL ||
    'https://gitlab.com/api/v4'
  ).replace(/\/$/, ''); // Remove trailing slash

  const token = config.token || process.env.GITLAB_TOKEN || '';
  if (!token) {
    throw new Error('GitLab token is required. Provide it in config.token or set GITLAB_TOKEN environment variable.');
  }

  const timeout = config.timeout || 30000;

  return { baseUrl, token, timeout };
};
