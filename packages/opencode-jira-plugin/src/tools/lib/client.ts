/**
 * JIRA API Client for OpenCode Tools
 * Functional approach following monorepo coding standards
 */

import type {
  ApiResponse,
  IssueBean,
  IssueSearchRequest,
  JiraClientConfig,
  PageBean,
  Project,
  SearchResults,
} from './types.ts';

/**
 * Client state interface
 */
interface JiraClientState {
  baseUrl: string;
  email: string;
  apiToken: string;
  timeout: number;
  userAgent: string;
}

/**
 * Create authentication header
 */
const createAuthHeader = (email: string, apiToken: string): string => {
  const credentials = `${email}:${apiToken}`;
  const encoded = btoa(credentials);
  return `Basic ${encoded}`;
};

/**
 * Initialize JIRA client state from config
 */
const initializeClientState = (config: JiraClientConfig = {}): JiraClientState => {
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

/**
 * Make an HTTP request to the JIRA API
 */
const request = async <T>(
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

/**
 * Search for issues using JQL (POST method)
 */
const searchIssues = async (state: JiraClientState, searchRequest: IssueSearchRequest): Promise<SearchResults> => {
  const response = await request<SearchResults>(state, '/rest/api/3/search', {
    method: 'POST',
    body: JSON.stringify(searchRequest),
  });
  return response.data;
};

/**
 * Get a single issue by ID or key
 */
const getIssue = async (
  state: JiraClientState,
  issueIdOrKey: string,
  fields?: string[],
  expand?: string[],
): Promise<IssueBean> => {
  const params = new URLSearchParams();

  if (fields?.length) {
    params.set('fields', fields.join(','));
  }

  if (expand?.length) {
    params.set('expand', expand.join(','));
  }

  const endpoint = `/rest/api/3/issue/${issueIdOrKey}${params.toString() ? `?${params}` : ''}`;
  const response = await request<IssueBean>(state, endpoint, { method: 'GET' });
  return response.data;
};

/**
 * Get projects paginated
 */
const getProjectsPaginated = async (
  state: JiraClientState,
  startAt = 0,
  maxResults = 50,
  query?: string,
): Promise<PageBean<Project>> => {
  const params = new URLSearchParams({
    startAt: startAt.toString(),
    maxResults: maxResults.toString(),
  });

  if (query) params.set('query', query);

  const response = await request<PageBean<Project>>(state, `/rest/api/3/project/search?${params}`, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Get all projects (simple method)
 */
const getProjects = async (state: JiraClientState): Promise<Project[]> => {
  const response = await request<Project[]>(state, '/rest/api/3/project', { method: 'GET' });
  return response.data;
};

/**
 * Get a single project by ID or key
 */
const getProject = async (state: JiraClientState, projectIdOrKey: string): Promise<Project> => {
  const endpoint = `/rest/api/3/project/${projectIdOrKey}`;
  const response = await request<Project>(state, endpoint, { method: 'GET' });
  return response.data;
};

/**
 * JIRA Client API
 * Functional interface for JIRA REST API v3
 */
export interface JiraClient {
  searchIssues: (searchRequest: IssueSearchRequest) => Promise<SearchResults>;
  getIssue: (issueIdOrKey: string, fields?: string[], expand?: string[]) => Promise<IssueBean>;
  getProjectsPaginated: (startAt?: number, maxResults?: number, query?: string) => Promise<PageBean<Project>>;
  getProjects: () => Promise<Project[]>;
  getProject: (projectIdOrKey: string) => Promise<Project>;
}

/**
 * Create a JIRA client instance
 */
export const createJiraClient = (config: JiraClientConfig = {}): JiraClient => {
  const state = initializeClientState(config);

  return {
    searchIssues: (searchRequest: IssueSearchRequest) => searchIssues(state, searchRequest),
    getIssue: (issueIdOrKey: string, fields?: string[], expand?: string[]) =>
      getIssue(state, issueIdOrKey, fields, expand),
    getProjectsPaginated: (startAt?: number, maxResults?: number, query?: string) =>
      getProjectsPaginated(state, startAt, maxResults, query),
    getProjects: () => getProjects(state),
    getProject: (projectIdOrKey: string) => getProject(state, projectIdOrKey),
  };
};
