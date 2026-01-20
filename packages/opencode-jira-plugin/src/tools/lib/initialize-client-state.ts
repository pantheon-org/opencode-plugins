/**
 * JIRA Client State Initialization
 */

import type { JiraClientConfig } from './types.ts';

/**
 * Client state interface
 */
export interface JiraClientState {
  baseUrl: string;
  email: string;
  apiToken: string;
  timeout: number;
  userAgent: string;
}

/**
 * Initialize JIRA client state from config and environment variables
 */
export const initializeClientState = (config: JiraClientConfig = {}): JiraClientState => {
  const baseUrl = config.baseUrl || process.env.JIRA_URL || process.env.JIRA_BASE_URL || '';
  if (!baseUrl) {
    throw new Error('Base URL is required. Provide it in config.baseUrl or set JIRA_URL environment variable.');
  }

  const email = config.email || process.env.JIRA_EMAIL || process.env.JIRA_USERNAME || '';
  if (!email) {
    throw new Error('Email is required. Provide it in config.email or set JIRA_EMAIL environment variable.');
  }

  const apiToken = config.apiToken || process.env.JIRA_API_TOKEN || '';
  if (!apiToken) {
    throw new Error('API token is required. Provide it in config.apiToken or set JIRA_API_TOKEN environment variable.');
  }

  return {
    baseUrl,
    email,
    apiToken,
    timeout: config.timeout || 30000,
    userAgent: 'OpenCode-Jira-Tools/1.0.0',
  };
};
