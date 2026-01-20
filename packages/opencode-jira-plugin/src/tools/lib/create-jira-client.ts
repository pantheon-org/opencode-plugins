/**
 * JIRA Client Factory
 * Creates a JIRA client instance with bound API methods
 */

import type { IssueBean, IssueSearchRequest, JiraClientConfig, PageBean, Project, SearchResults } from './types.ts';
import { initializeClientState } from './initialize-client-state.ts';
import { request } from './request.ts';

/**
 * JIRA Client API Interface
 */
export interface JiraClient {
  searchIssues: (searchRequest: IssueSearchRequest) => Promise<SearchResults>;
  getIssue: (issueIdOrKey: string, fields?: string[], expand?: string[]) => Promise<IssueBean>;
  getProjectsPaginated: (startAt?: number, maxResults?: number, query?: string) => Promise<PageBean<Project>>;
  getProjects: () => Promise<Project[]>;
  getProject: (projectIdOrKey: string) => Promise<Project>;
}

/**
 * Create a JIRA client instance with all API methods
 */
export const createJiraClient = (config: JiraClientConfig = {}): JiraClient => {
  const state = initializeClientState(config);

  return {
    searchIssues: async (searchRequest: IssueSearchRequest): Promise<SearchResults> => {
      const response = await request<SearchResults>(state, '/rest/api/3/search', {
        method: 'POST',
        body: JSON.stringify(searchRequest),
      });
      return response.data;
    },

    getIssue: async (issueIdOrKey: string, fields?: string[], expand?: string[]): Promise<IssueBean> => {
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
    },

    getProjectsPaginated: async (startAt = 0, maxResults = 50, query?: string): Promise<PageBean<Project>> => {
      const params = new URLSearchParams({
        startAt: startAt.toString(),
        maxResults: maxResults.toString(),
      });

      if (query) params.set('query', query);

      const response = await request<PageBean<Project>>(state, `/rest/api/3/project/search?${params}`, {
        method: 'GET',
      });
      return response.data;
    },

    getProjects: async (): Promise<Project[]> => {
      const response = await request<Project[]>(state, '/rest/api/3/project', { method: 'GET' });
      return response.data;
    },

    getProject: async (projectIdOrKey: string): Promise<Project> => {
      const endpoint = `/rest/api/3/project/${projectIdOrKey}`;
      const response = await request<Project>(state, endpoint, { method: 'GET' });
      return response.data;
    },
  };
};
