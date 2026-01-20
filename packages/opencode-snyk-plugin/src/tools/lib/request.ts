/**
 * Make authenticated request to Snyk API
 */

import { createLogger } from '@pantheon-org/opencode-core';

import { buildUrl } from './build-url.ts';
import type { SnykClientConfig } from './create-client.ts';
import { extractMetadata } from './extract-metadata.ts';
import type { PaginationOptions } from './types.ts';

const log = createLogger({ plugin: 'snyk', tool: 'request' });

export const request = async <T>(
  client: SnykClientConfig,
  endpoint: string,
  options: RequestInit & { pagination?: PaginationOptions } = {},
): Promise<T> => {
  const { pagination, ...fetchOptions } = options;
  const url = buildUrl(client, endpoint, pagination);
  const headers = new Headers(fetchOptions.headers);

  headers.set('Authorization', `token ${client.token}`);
  headers.set('Content-Type', 'application/vnd.api+json');
  headers.set('Accept', 'application/vnd.api+json');
  headers.set('User-Agent', 'OpenCode-Snyk-Tools/1.0.0');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), client.timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const metadata = extractMetadata(response);

    // Log deprecation warnings
    if (metadata.deprecation) {
      log.warn('API endpoint deprecated', {
        deprecation: metadata.deprecation,
        sunset: metadata.sunset,
        endpoint,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Snyk API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${client.timeout}ms`);
      }
      throw error;
    }
    throw new Error(`Unknown error: ${String(error)}`);
  }
};
