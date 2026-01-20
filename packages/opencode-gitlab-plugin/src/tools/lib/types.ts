/**
 * GitLab API Types for OpenCode Tools
 * Subset of types from the full GitLab CLI implementation
 */

export interface GitLabRepository {
  id: number;
  name: string;
  description: string | null;
  web_url: string;
  created_at: string;
  last_activity_at: string;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
  };
  path_with_namespace: string;
  default_branch: string;
  visibility: 'private' | 'internal' | 'public';
  archived: boolean;
  fork: boolean;
  stars_count: number;
  forks_count: number;
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string | null;
  state: 'opened' | 'closed' | 'locked' | 'merged';
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  target_branch: string;
  source_branch: string;
  author: {
    id: number;
    name: string;
    username: string;
    email: string;
  };
  assignee: {
    id: number;
    name: string;
    username: string;
    email: string;
  } | null;
  web_url: string;
  project_id: number;
  labels: string[];
}

export interface GitLabClientConfig {
  baseUrl?: string;
  token?: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

/**
 * GitLab TODO item representing a task assigned to the user
 */
export interface GitLabTodo {
  /** Unique identifier for the TODO */
  id: number;
  /** State of the TODO item */
  state: 'pending' | 'done';
  /** ISO timestamp when the TODO was created */
  created_at: string;
  /** Action that created this TODO */
  action_name:
    | 'assigned'
    | 'mentioned'
    | 'build_failed'
    | 'marked'
    | 'approval_required'
    | 'unmergeable'
    | 'directly_addressed';
  /** Type of the target object */
  target_type: 'Issue' | 'MergeRequest' | 'Commit' | 'Pipeline';
  /** Target object details */
  target: {
    /** ID of the target object */
    id: number;
    /** Internal ID (for issues/MRs) */
    iid?: number;
    /** Title of the target object */
    title: string;
    /** Web URL to the target object */
    web_url: string;
  };
  /** Direct URL to the target */
  target_url: string;
  /** Body text of the TODO */
  body: string;
  /** Author who created the TODO */
  author: {
    /** User ID */
    id: number;
    /** Full name */
    name: string;
    /** Username */
    username: string;
  };
  /** Project containing the target */
  project: {
    /** Project ID */
    id: number;
    /** Project name */
    name: string;
    /** Full name with namespace */
    name_with_namespace: string;
    /** Path with namespace */
    path_with_namespace: string;
  } | null;
}
