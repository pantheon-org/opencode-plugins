/**
 * HTTP Request Handler for JIRA API
 */

import type { ApiResponse } from './types.ts';
import type { JiraClientState } from './initialize-client-state.ts';
import { createAuthHeader } from './create-auth-header.ts';

/**
 * Make an HTTP request to the JIRA API
 */
export const request = async <T>(
  state: JiraClientState,
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const url = `${state.baseUrl}${endpoint}`;
  const headers = new Headers(options.headers);

  headers.set('Authorization', createAuthHeader(state.email, state.apiToken));
  headers.set('Accept', 'application/json');
  headers.set('User-Agent', state.userAgent);

  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), state.timeout);

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
        throw new Error(`Request timeout after ${state.timeout}ms`);
      }
      throw error;
    }
    throw new Error(String(error));
  }
};
