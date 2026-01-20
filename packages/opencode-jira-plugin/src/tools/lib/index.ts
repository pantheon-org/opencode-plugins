/**
 * JIRA API Client Library
 * Barrel module for client and types
 */

export { createJiraClient } from './client.js';
export type { JiraClient } from './client.js';
export type {
  ApiResponse,
  IssueBean,
  IssueSearchRequest,
  JiraClientConfig,
  PageBean,
  Project,
  SearchResults,
} from './types.js';
