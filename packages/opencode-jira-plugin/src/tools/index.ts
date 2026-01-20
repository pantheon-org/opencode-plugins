/**
 * JIRA OpenCode Tools Module
 *
 * This module provides OpenCode tools for interacting with the JIRA API.
 *
 * Available tools:
 * - jira-search-issues: Search JIRA issues with JQL filters
 * - jira-get-issue: Get a specific issue by key or ID
 * - jira-list-projects: List all accessible projects
 * - jira-get-project: Get a specific project by key or ID
 */

export { default as jiraSearchIssues } from './jira-search-issues.js';
export { default as jiraGetIssue } from './jira-get-issue.js';
export { default as jiraListProjects } from './jira-list-projects.js';
export { default as jiraGetProject } from './jira-get-project.js';

export type { SearchIssuesArgs, SearchIssuesData } from './jira-search-issues.js';
export type { GetIssueArgs, GetIssueData } from './jira-get-issue.js';
export type { ListProjectsArgs, ListProjectsData } from './jira-list-projects.js';
export type { GetProjectArgs, GetProjectData } from './jira-get-project.js';

export type {
  IssueBean,
  SearchResults,
  Project,
  User,
  IssueSearchRequest,
  PageBean,
  JiraClientConfig,
  ApiResponse,
} from './lib/types.js';
