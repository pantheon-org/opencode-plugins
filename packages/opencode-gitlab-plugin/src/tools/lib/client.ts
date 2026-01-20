/**
 * GitLab API Client for OpenCode Tools
 * Functional client with arrow functions
 */

import type { ApiResponse, GitLabClientConfig, GitLabMergeRequest, GitLabRepository, GitLabTodo } from './types.ts';

/**
 * Create a GitLab API client configuration
 */
export const createClientConfig = (config: GitLabClientConfig = {}): Required<GitLabClientConfig> => {
  const baseUrl = (
    config.baseUrl ||
    process.env.GITLAB_API_URL ||
    process.env.GITLAB_URL ||
    'https://gitlab.com/api/v4'
  ).replace(/\/$/, ''); // Remove trailing slash

  const token = config.token || process.env.GITLAB_TOKEN || '';
  if (!token) {
    throw new Error('GitLab token is required. Provide it in config.token or set GITLAB_TOKEN environment variable.');
  }

  const timeout = config.timeout || 30000;

  return { baseUrl, token, timeout };
};

/**
 * Make an HTTP request to the GitLab API
 */
const request = async <T>(
  endpoint: string,
  config: Required<GitLabClientConfig>,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const url = `${config.baseUrl}${endpoint}`;
  const headers = new Headers(options.headers);

  headers.set('Authorization', `Bearer ${config.token}`);
  headers.set('Accept', 'application/json');
  headers.set('User-Agent', 'OpenCode-GitLab-Tools/1.0.0');

  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

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
        throw new Error(`Request timeout after ${config.timeout}ms`);
      }
      throw error;
    }
    throw new Error(String(error));
  }
};

/**
 * List repositories (projects)
 */
export const listRepositories = async (
  config: GitLabClientConfig,
  options?: {
    owned?: boolean;
    membership?: boolean;
    perPage?: number;
    page?: number;
    search?: string;
  },
): Promise<GitLabRepository[]> => {
  const clientConfig = createClientConfig(config);
  const params = new URLSearchParams();

  if (options?.owned) {
    params.set('owned', 'true');
  }

  if (options?.membership) {
    params.set('membership', 'true');
  }

  if (options?.perPage) {
    params.set('per_page', options.perPage.toString());
  }

  if (options?.page) {
    params.set('page', options.page.toString());
  }

  if (options?.search) {
    params.set('search', options.search);
  }

  const response = await request<GitLabRepository[]>(`/projects?${params}`, clientConfig, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Get a single repository by ID
 */
export const getRepository = async (config: GitLabClientConfig, id: string | number): Promise<GitLabRepository> => {
  const clientConfig = createClientConfig(config);
  const response = await request<GitLabRepository>(`/projects/${id}`, clientConfig, {
    method: 'GET',
  });
  return response.data;
};

/**
 * List merge requests
 */
export const listMergeRequests = async (
  config: GitLabClientConfig,
  options?: {
    projectId?: string | number;
    state?: 'opened' | 'closed' | 'locked' | 'merged' | 'all';
    authorUsername?: string;
    assigneeUsername?: string;
    targetBranch?: string;
    sourceBranch?: string;
    labels?: string[];
    perPage?: number;
    page?: number;
  },
): Promise<GitLabMergeRequest[]> => {
  const clientConfig = createClientConfig(config);
  const params = new URLSearchParams();

  if (options?.state && options.state !== 'all') {
    params.set('state', options.state);
  }

  if (options?.authorUsername) {
    params.set('author_username', options.authorUsername);
  }

  if (options?.assigneeUsername) {
    params.set('assignee_username', options.assigneeUsername);
  }

  if (options?.targetBranch) {
    params.set('target_branch', options.targetBranch);
  }

  if (options?.sourceBranch) {
    params.set('source_branch', options.sourceBranch);
  }

  if (options?.labels && options.labels.length > 0) {
    params.set('labels', options.labels.join(','));
  }

  if (options?.perPage) {
    params.set('per_page', options.perPage.toString());
  }

  if (options?.page) {
    params.set('page', options.page.toString());
  }

  const endpoint = options?.projectId
    ? `/projects/${options.projectId}/merge_requests?${params}`
    : `/merge_requests?${params}`;

  const response = await request<GitLabMergeRequest[]>(endpoint, clientConfig, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Get a single merge request
 */
export const getMergeRequest = async (
  config: GitLabClientConfig,
  projectId: string | number,
  mergeRequestIid: number,
): Promise<GitLabMergeRequest> => {
  const clientConfig = createClientConfig(config);
  const response = await request<GitLabMergeRequest>(
    `/projects/${projectId}/merge_requests/${mergeRequestIid}`,
    clientConfig,
    {
      method: 'GET',
    },
  );
  return response.data;
};

/**
 * List TODOs for the authenticated user
 */
export const listTodos = async (
  config: GitLabClientConfig,
  options?: {
    state?: 'pending' | 'done';
    action?:
      | 'assigned'
      | 'mentioned'
      | 'build_failed'
      | 'marked'
      | 'approval_required'
      | 'unmergeable'
      | 'directly_addressed';
    targetType?: 'Issue' | 'MergeRequest' | 'Commit' | 'Pipeline';
    projectId?: string | number;
    authorId?: string | number;
    perPage?: number;
    page?: number;
  },
): Promise<GitLabTodo[]> => {
  const clientConfig = createClientConfig(config);
  const params = new URLSearchParams();

  if (options?.state) {
    params.set('state', options.state);
  }

  if (options?.action) {
    params.set('action', options.action);
  }

  if (options?.targetType) {
    params.set('type', options.targetType);
  }

  if (options?.projectId) {
    params.set('project_id', options.projectId.toString());
  }

  if (options?.authorId) {
    params.set('author_id', options.authorId.toString());
  }

  if (options?.perPage) {
    params.set('per_page', options.perPage.toString());
  }

  if (options?.page) {
    params.set('page', options.page.toString());
  }

  const response = await request<GitLabTodo[]>(`/todos?${params}`, clientConfig, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Get a single TODO by ID
 */
export const getTodo = async (config: GitLabClientConfig, todoId: number): Promise<GitLabTodo> => {
  const clientConfig = createClientConfig(config);
  const response = await request<GitLabTodo>(`/todos/${todoId}`, clientConfig, {
    method: 'GET',
  });
  return response.data;
};

/**
 * Mark a TODO as done
 */
export const markTodoAsDone = async (config: GitLabClientConfig, todoId: number): Promise<GitLabTodo> => {
  const clientConfig = createClientConfig(config);
  const response = await request<GitLabTodo>(`/todos/${todoId}/mark_as_done`, clientConfig, {
    method: 'POST',
  });
  return response.data;
};

/**
 * Mark all TODOs as done
 */
export const markAllTodosAsDone = async (config: GitLabClientConfig): Promise<void> => {
  const clientConfig = createClientConfig(config);
  await request<void>('/todos/mark_as_done', clientConfig, {
    method: 'POST',
  });
};
