/**
 * Create authentication header for JIRA API
 */

/**
 * Create Basic Auth header from email and API token
 */
export const createAuthHeader = (email: string, apiToken: string): string => {
  const credentials = `${email}:${apiToken}`;
  const encoded = btoa(credentials);
  return `Basic ${encoded}`;
};
