/**
 * GitLab API Client - Barrel Module
 * Re-exports all API functions following one-function-per-module principle
 */

// Utility functions
export { createClientConfig } from './create-client-config.ts';
export { request } from './request.ts';

// Repository operations
export { listRepositories } from './list-repositories.ts';
export { getRepository } from './get-repository.ts';

// Merge request operations
export { listMergeRequests } from './list-merge-requests.ts';
export { getMergeRequest } from './get-merge-request.ts';

// Todo operations
export { listTodos } from './list-todos.ts';
export { getTodo } from './get-todo.ts';
export { markTodoAsDone } from './mark-todo-as-done.ts';
export { markAllTodosAsDone } from './mark-all-todos-as-done.ts';
