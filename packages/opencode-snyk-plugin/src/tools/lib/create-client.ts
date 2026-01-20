/**
 * Create Snyk API client instance
 */

export interface SnykClientOptions {
  /** Snyk API token (if not provided, will use SNYK_TOKEN env var) */
  token?: string;
  /** Base URL for Snyk API (default: https://api.snyk.io) */
  baseUrl?: string;
  /** API version (default: 2023-06-22) */
  apiVersion?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface SnykClientConfig {
  token: string;
  baseUrl: string;
  apiVersion: string;
  timeout: number;
}

export const createClient = (options: SnykClientOptions = {}): SnykClientConfig => {
  const token = options.token || process.env.SNYK_TOKEN || '';
  if (!token) {
    throw new Error('Snyk API token is required. Provide it in options.token or set SNYK_TOKEN environment variable.');
  }

  return {
    token,
    baseUrl: options.baseUrl || process.env.SNYK_API_URL || 'https://api.snyk.io',
    apiVersion: options.apiVersion || '2023-06-22',
    timeout: options.timeout || 30000,
  };
};

export const createClientFromEnv = (): SnykClientConfig => {
  const token = process.env.SNYK_TOKEN;
  if (!token) {
    throw new Error('SNYK_TOKEN environment variable is required. Get your token from https://app.snyk.io/account');
  }

  return createClient({
    token,
    baseUrl: process.env.SNYK_API_URL,
  });
};
