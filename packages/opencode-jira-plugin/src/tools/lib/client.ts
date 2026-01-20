/**
 * JIRA API Client for OpenCode Tools
 * Simplified client based on the shared API client pattern
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
 * Basic Authentication strategy for JIRA API
 */
class BasicAuth {
  constructor(
    private username: string,
    private password: string,
  ) {}

  getAuthHeader(): string {
    const credentials = `${this.username}:${this.password}`;
    const encoded = btoa(credentials);
    return `Basic ${encoded}`;
  }
}

/**
 * JIRA API Client
 * Provides methods to interact with JIRA REST API v3
 */
export class JiraClient {
  private baseUrl: string;
  private auth: BasicAuth;
  private timeout: number;
  private userAgent: string;

  constructor(config: JiraClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.JIRA_URL || process.env.JIRA_BASE_URL || '';
    if (!this.baseUrl) {
      throw new Error(
        'Base URL is required. Provide it in config.baseUrl or set JIRA_URL environment variable.',
      );
    }

    const email = config.email || process.env.JIRA_EMAIL || process.env.JIRA_USERNAME || '';
    if (!email) {
      throw new Error(
        'Email is required. Provide it in config.email or set JIRA_EMAIL environment variable.',
      );
    }

    const apiToken = config.apiToken || process.env.JIRA_API_TOKEN || '';
    if (!apiToken) {
      throw new Error(
        'API token is required. Provide it in config.apiToken or set JIRA_API_TOKEN environment variable.',
      );
    }

    this.auth = new BasicAuth(email, apiToken);
    this.timeout = config.timeout || 30000;
    this.userAgent = 'OpenCode-Jira-Tools/1.0.0';
  }

  /**
   * Make an HTTP request to the JIRA API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    headers.set('Authorization', this.auth.getAuthHeader());
    headers.set('Accept', 'application/json');
    headers.set('User-Agent', this.userAgent);

    if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
      headers.set('Content-Type', 'application/json');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

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
          throw new Error(`Request timeout after ${this.timeout}ms`);
        }
        throw error;
      }
      throw new Error(String(error));
    }
  }

  /**
   * Search for issues using JQL (POST method)
   */
  async searchIssues(request: IssueSearchRequest): Promise<SearchResults> {
    const response = await this.request<SearchResults>('/rest/api/3/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.data;
  }

  /**
   * Get a single issue by ID or key
   */
  async getIssue(issueIdOrKey: string, fields?: string[], expand?: string[]): Promise<IssueBean> {
    const params = new URLSearchParams();

    if (fields?.length) {
      params.set('fields', fields.join(','));
    }

    if (expand?.length) {
      params.set('expand', expand.join(','));
    }

    const endpoint = `/rest/api/3/issue/${issueIdOrKey}${params.toString() ? `?${params}` : ''}`;
    const response = await this.request<IssueBean>(endpoint, { method: 'GET' });
    return response.data;
  }

  /**
   * Get projects paginated
   */
  async getProjectsPaginated(
    startAt = 0,
    maxResults = 50,
    query?: string,
  ): Promise<PageBean<Project>> {
    const params = new URLSearchParams({
      startAt: startAt.toString(),
      maxResults: maxResults.toString(),
    });

    if (query) params.set('query', query);

    const response = await this.request<PageBean<Project>>(`/rest/api/3/project/search?${params}`, {
      method: 'GET',
    });
    return response.data;
  }

  /**
   * Get all projects (simple method)
   */
  async getProjects(): Promise<Project[]> {
    const response = await this.request<Project[]>('/rest/api/3/project', { method: 'GET' });
    return response.data;
  }

  /**
   * Get a single project by ID or key
   */
  async getProject(projectIdOrKey: string): Promise<Project> {
    const endpoint = `/rest/api/3/project/${projectIdOrKey}`;
    const response = await this.request<Project>(endpoint, { method: 'GET' });
    return response.data;
  }
}
