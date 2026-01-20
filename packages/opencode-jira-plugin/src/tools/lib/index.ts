/**
 * JIRA API Client Library
 * Barrel module for client and types
 */

export { createJiraClient } from './create-jira-client.js';
export type { JiraClient } from './create-jira-client.js';
export type { JiraClientState } from './initialize-client-state.js';
export { createAuthHeader } from './create-auth-header.js';
export { initializeClientState } from './initialize-client-state.js';
export { request } from './request.js';
export type {
  ApiResponse,
  IssueBean,
  IssueSearchRequest,
  JiraClientConfig,
  PageBean,
  Project,
  SearchResults,
} from './types.js';
