/**
 * Make an HTTP request to the GitLab API
 */

import type { ApiResponse, GitLabClientConfig } from './types.ts';

export const request = async <T>(
  endpoint: string,
  config: Required<GitLabClientConfig>,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const url = `${config.baseUrl}${endpoint}`;
  const headers = new Headers(options.headers);

  headers.set('Authorization', `Bearer ${config.token}`);
  headers.set('Accept', 'application/json');
  headers.set('User-Agent', 'OpenCode-GitLab-Tools/1.0.0');

  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return {
      data: data as T,
      status: response.status,
      headers: response.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${config.timeout}ms`);
      }
      throw error;
    }
    throw new Error(String(error));
  }
};
