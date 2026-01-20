/**
 * JIRA API Types for OpenCode Tools
 * Subset of types from the full JIRA CLI implementation
 */

export interface AvatarUrls {
  '16x16'?: string;
  '24x24'?: string;
  '32x32'?: string;
  '48x48'?: string;
}

export interface User {
  self?: string;
  accountId?: string;
  accountType?: 'atlassian' | 'app' | 'customer' | 'unknown';
  name?: string;
  key?: string;
  emailAddress?: string;
  avatarUrls?: AvatarUrls;
  displayName?: string;
  active?: boolean;
  timeZone?: string;
  locale?: string;
}

export interface StatusCategory {
  self?: string;
  id?: number;
  key?: string;
  colorName?: string;
  name?: string;
}

export interface StatusDetails {
  self?: string;
  description?: string;
  iconUrl?: string;
  name?: string;
  id?: string;
  statusCategory?: StatusCategory;
}

export interface Priority {
  self?: string;
  iconUrl?: string;
  name?: string;
  id?: string;
  statusColor?: string;
  description?: string;
}

export interface IssueType {
  self?: string;
  id?: string;
  description?: string;
  iconUrl?: string;
  name?: string;
  subtask?: boolean;
  avatarId?: number;
  entityId?: string;
  hierarchyLevel?: number;
}

export interface Project {
  expand?: string;
  self?: string;
  id?: string;
  key?: string;
  description?: string;
  lead?: User;
  url?: string;
  email?: string;
  name?: string;
  roles?: Record<string, string>;
  avatarUrls?: AvatarUrls;
  projectTypeKey?: 'software' | 'service_desk' | 'business';
  simplified?: boolean;
  style?: 'next-gen' | 'classic';
  isPrivate?: boolean;
  archived?: boolean;
  archivedDate?: string;
  archivedBy?: User;
}

export interface IssueBean {
  expand?: string;
  id?: string;
  self?: string;
  key?: string;
  fields?: Record<string, any>;
  renderedFields?: Record<string, any>;
  properties?: Record<string, any>;
  names?: Record<string, string>;
}

export interface SearchResults {
  expand?: string;
  startAt?: number;
  maxResults?: number;
  total?: number;
  issues?: IssueBean[];
  warningMessages?: string[];
  names?: Record<string, string>;
}

export interface IssueSearchRequest {
  jql?: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
  properties?: string[];
  fieldsByKeys?: boolean;
}

export interface PageBean<T> {
  self?: string;
  nextPage?: string;
  maxResults?: number;
  startAt?: number;
  total?: number;
  isLast?: boolean;
  values?: T[];
}

export interface JiraClientConfig {
  baseUrl?: string;
  email?: string;
  apiToken?: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}
