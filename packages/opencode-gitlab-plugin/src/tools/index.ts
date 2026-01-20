/**
 * GitLab OpenCode Tools Module
 *
 * This module provides OpenCode tools for interacting with the GitLab API.
 *
 * Available tools:
 * - gitlab-list-repos: List GitLab repositories (projects)
 * - gitlab-list-merge-requests: List merge requests with filtering
 * - gitlab-list-todos: List TODO items for the authenticated user
 * - gitlab-get-todo: Get a specific TODO by ID
 * - gitlab-mark-todo-done: Mark a TODO as done
 * - gitlab-mark-all-todos-done: Mark all TODOs as done
 */

export { default as gitlabListRepos } from './gitlab-list-repos.ts';
export { default as gitlabListMergeRequests } from './gitlab-list-merge-requests.ts';
export { default as gitlabListTodos } from './gitlab-list-todos.ts';
export { default as gitlabGetTodo } from './gitlab-get-todo.ts';
export { default as gitlabMarkTodoDone } from './gitlab-mark-todo-done.ts';
export { default as gitlabMarkAllTodosDone } from './gitlab-mark-all-todos-done.ts';

export type { ListReposArgs, ListReposData } from './gitlab-list-repos.ts';
export type { ListMergeRequestsArgs, ListMergeRequestsData } from './gitlab-list-merge-requests.ts';
export type { ListTodosArgs, ListTodosData } from './gitlab-list-todos.ts';
export type { GetTodoArgs, GetTodoData } from './gitlab-get-todo.ts';
export type { MarkTodoDoneArgs, MarkTodoDoneData } from './gitlab-mark-todo-done.ts';
export type { MarkAllTodosDoneArgs, MarkAllTodosDoneData } from './gitlab-mark-all-todos-done.ts';

export type {
  GitLabRepository,
  GitLabMergeRequest,
  GitLabTodo,
  GitLabClientConfig,
  ApiResponse,
  PaginatedResponse,
} from './lib/types.ts';
