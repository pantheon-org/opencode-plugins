/**
 * Generate an SBOM for a project
 */

import type { SnykClientConfig } from './create-client.ts';
import type { SBOMDocument, SBOMOptions } from './types.ts';

export const generateSBOM = async (
  client: SnykClientConfig,
  organizationId: string,
  projectId: string,
  options: SBOMOptions,
): Promise<SBOMDocument> => {
  const url = new URL(`${client.baseUrl}/rest/orgs/${organizationId}/projects/${projectId}/sbom`);
  url.searchParams.set('version', client.apiVersion);
  url.searchParams.set('format', options.format);

  if (options.exclude?.length) {
    options.exclude.forEach((item) => {
      url.searchParams.append('exclude', item);
    });
  }

  const headers = new Headers();
  headers.set('Authorization', `token ${client.token}`);
  headers.set('User-Agent', 'OpenCode-Snyk-Tools/1.0.0');

  // Set Accept header based on format
  if (options.format.includes('json')) {
    headers.set('Accept', 'application/json');
  } else if (options.format.includes('xml')) {
    headers.set('Accept', 'application/xml');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), client.timeout);

  try {
    const response = await fetch(url.toString(), {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Snyk API error (${response.status}): ${errorText}`);
    }

    // Return text for XML formats, JSON for JSON formats
    if (options.format.endsWith('+xml')) {
      return (await response.text()) as unknown as SBOMDocument;
    }

    const data = await response.json();
    return data as SBOMDocument;
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
