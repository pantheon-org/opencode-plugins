/**
 * GitLab OpenCode Plugin
 *
 * This plugin provides tools for interacting with the GitLab API to manage
 * repositories, merge requests, and TODO items.
 *
 * Environment Variables:
 * - GITLAB_TOKEN (required): Your GitLab API token
 * - GITLAB_API_URL (optional): Custom GitLab API URL (defaults to https://gitlab.com/api/v4)
 *
 * Available Tools:
 * - gitlab_list_repos: List GitLab repositories (projects)
 * - gitlab_list_merge_requests: List merge requests with filtering
 * - gitlab_list_todos: List TODO items for the authenticated user
 * - gitlab_get_todo: Get a specific TODO by ID
 * - gitlab_mark_todo_done: Mark a TODO as done
 * - gitlab_mark_all_todos_done: Mark all TODOs as done
 * - load_gitlab_skill: Load comprehensive GitLab integration skill documentation
 */

import { createLogger } from '@libs/opencode-core/logger';
import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin';

// Import tool implementations
import gitlabGetTodo from './tools/gitlab-get-todo.ts';
import gitlabListMergeRequests from './tools/gitlab-list-merge-requests.ts';
import gitlabListRepos from './tools/gitlab-list-repos.ts';
import gitlabListTodos from './tools/gitlab-list-todos.ts';
import gitlabMarkAllTodosDone from './tools/gitlab-mark-all-todos-done.ts';
import gitlabMarkTodoDone from './tools/gitlab-mark-todo-done.ts';
import loadGitlabSkill from './tools/load-gitlab-skill.ts';

// Create logger for the plugin
const log = createLogger({ plugin: 'gitlab' });

export const GitLabPlugin: Plugin = async (ctx) => {
  return {
    event: async ({ event }) => {
      // Get event logging configuration
      const config = (ctx.client.config as any)?.gitlab?.events || { enabled: true };
      if (!config.enabled) return;

      // Log all events at debug level
      log.debug('OpenCode event received', {
        type: event.type,
        plugin: 'gitlab',
      });

      // Log git branch changes
      if (config.branchChanges && event.type === 'vcs.branch.updated') {
        const currentBranch = (event as any).branch;
        const previousBranch = (event as any).previousBranch;

        log.info('Git branch changed', {
          currentBranch,
          previousBranch,
          note: 'Consider checking gitlab_list_merge_requests for pending MRs on this branch',
        });
      }

      if (config.sessionLifecycle && event.type === 'session.created') {
        log.info('New OpenCode session started', {
          sessionID: (event as any).sessionID,
          project: ctx.project.worktree,
        });
      }

      if (config.sessionLifecycle && event.type === 'session.idle') {
        log.debug('OpenCode session became idle', {
          sessionID: (event as any).sessionID,
        });
      }

      if (config.sessionLifecycle && event.type === 'session.error') {
        log.error('OpenCode session error', {
          sessionID: (event as any).sessionID,
          error: (event as any).error,
        });
      }
    },
    // Note: Config hook removed - configuration should be passed via environment variables
    // or tool arguments instead of modifying the OpenCode config object
    auth: {
      provider: 'gitlab',
      loader: async (authFunc, provider) => {
        // Load GitLab authentication from stored credentials
        const auth = await authFunc();
        if (auth.type === 'api') {
          const token = (auth as any).key || (auth as any).access;
          // Use provider field if custom baseUrl was provided, else use env or default
          const baseUrl =
            (provider as any).provider !== 'gitlab'
              ? (provider as any).provider
              : process.env.GITLAB_API_URL || 'https://gitlab.com/api/v4';

          return {
            token,
            baseUrl,
          };
        }
        throw new Error(`Unsupported auth type: ${auth.type}`);
      },
      methods: [
        {
          type: 'api',
          label: 'GitLab API Token',
          prompts: [
            {
              type: 'text',
              key: 'token',
              message: 'Enter your GitLab API token',
              placeholder: 'Get your token from https://gitlab.com/-/profile/personal_access_tokens',
              validate: (value) => {
                if (!value || value.trim().length === 0) {
                  return 'API token is required';
                }
                return undefined;
              },
            },
            {
              type: 'text',
              key: 'baseUrl',
              message: 'Enter GitLab API base URL (optional)',
              placeholder: 'https://gitlab.com/api/v4',
            },
          ],
          authorize: async (inputs) => {
            const token = inputs?.token;
            const baseUrl = inputs?.baseUrl || 'https://gitlab.com/api/v4';

            if (!token) {
              return { type: 'failed' };
            }

            // Store the token as the key
            return {
              type: 'success',
              key: token,
              provider: baseUrl !== 'https://gitlab.com/api/v4' ? baseUrl : undefined,
            };
          },
        },
      ],
    },
    tool: {
      gitlab_list_repos: tool({
        description:
          'List GitLab repositories (projects) with optional filtering by ownership, membership, or search query. Returns repository details including id, name, namespace, visibility, and activity metrics.',
        args: {
          owned: tool.schema.boolean().optional().describe('Only return repositories owned by the authenticated user'),
          membership: tool.schema.boolean().optional().describe('Only return repositories where the user is a member'),
          search: tool.schema
            .string()
            .optional()
            .describe('Search query to filter repositories by name or description'),
          perPage: tool.schema.number().optional().describe('Number of results per page (default: 20, max: 100)'),
          page: tool.schema.number().optional().describe('Page number for pagination (default: 1)'),
          baseUrl: tool.schema.string().optional().describe('GitLab API base URL (overrides GITLAB_API_URL env var)'),
          token: tool.schema.string().optional().describe('GitLab API token (overrides GITLAB_TOKEN env var)'),
        },
        execute: async (args) => {
          try {
            const result = await gitlabListRepos(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error listing repositories: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      gitlab_list_merge_requests: tool({
        description:
          'List GitLab merge requests with flexible filtering by project, state, author, assignee, branches, and labels. Returns detailed MR information including state, participants, and timestamps.',
        args: {
          projectId: tool.schema
            .string()
            .optional()
            .describe("Filter by project ID or path (e.g., '123' or 'group/project')"),
          state: tool.schema
            .string()
            .optional()
            .describe('Filter by state: opened, closed, locked, merged, or all (default: all)'),
          author: tool.schema.string().optional().describe('Filter by author username'),
          assignee: tool.schema.string().optional().describe('Filter by assignee username'),
          targetBranch: tool.schema.string().optional().describe('Filter by target branch name'),
          sourceBranch: tool.schema.string().optional().describe('Filter by source branch name'),
          labels: tool.schema.string().optional().describe('Filter by labels (comma-separated)'),
          perPage: tool.schema.number().optional().describe('Number of results per page (default: 20, max: 100)'),
          page: tool.schema.number().optional().describe('Page number for pagination (default: 1)'),
          baseUrl: tool.schema.string().optional().describe('GitLab API base URL (overrides GITLAB_API_URL env var)'),
          token: tool.schema.string().optional().describe('GitLab API token (overrides GITLAB_TOKEN env var)'),
        },
        execute: async (args) => {
          try {
            const result = await gitlabListMergeRequests(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error listing merge requests: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      gitlab_list_todos: tool({
        description:
          'List TODO items for the authenticated GitLab user with filtering by state, action, target type, project, and author. Returns summary statistics and detailed TODO information.',
        args: {
          state: tool.schema.enum(['pending', 'done']).optional().describe('Filter by TODO state (pending or done)'),
          action: tool.schema
            .enum([
              'assigned',
              'mentioned',
              'build_failed',
              'marked',
              'approval_required',
              'unmergeable',
              'directly_addressed',
            ])
            .optional()
            .describe('Filter by action type that created the TODO'),
          targetType: tool.schema
            .enum(['Issue', 'MergeRequest', 'Commit', 'Pipeline'])
            .optional()
            .describe('Filter by target type'),
          projectId: tool.schema.number().optional().describe('Filter by project ID'),
          authorId: tool.schema.number().optional().describe('Filter by author ID'),
          perPage: tool.schema.number().optional().describe('Number of results per page (default: 20)'),
          page: tool.schema.number().optional().describe('Page number (1-indexed, default: 1)'),
          token: tool.schema.string().optional().describe('GitLab API token (overrides GITLAB_TOKEN env var)'),
          baseUrl: tool.schema.string().optional().describe('GitLab API base URL (overrides GITLAB_API_URL env var)'),
          timeout: tool.schema.number().optional().describe('Request timeout in milliseconds (default: 30000)'),
        },
        execute: async (args) => {
          try {
            const result = await gitlabListTodos(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error listing TODOs: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      gitlab_get_todo: tool({
        description:
          'Get a specific GitLab TODO item by ID. Returns detailed information about the TODO including target, author, and project details.',
        args: {
          todoId: tool.schema.number().describe('TODO ID to retrieve'),
          token: tool.schema.string().optional().describe('GitLab API token (overrides GITLAB_TOKEN env var)'),
          baseUrl: tool.schema.string().optional().describe('GitLab API base URL (overrides GITLAB_API_URL env var)'),
          timeout: tool.schema.number().optional().describe('Request timeout in milliseconds (default: 30000)'),
        },
        execute: async (args) => {
          try {
            const result = await gitlabGetTodo(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error getting TODO: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      gitlab_mark_todo_done: tool({
        description:
          'Mark a specific GitLab TODO as done. Once marked as done, the TODO will no longer appear in pending lists.',
        args: {
          todoId: tool.schema.number().describe('TODO ID to mark as done'),
          token: tool.schema.string().optional().describe('GitLab API token (overrides GITLAB_TOKEN env var)'),
          baseUrl: tool.schema.string().optional().describe('GitLab API base URL (overrides GITLAB_API_URL env var)'),
          timeout: tool.schema.number().optional().describe('Request timeout in milliseconds (default: 30000)'),
        },
        execute: async (args) => {
          try {
            const result = await gitlabMarkTodoDone(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error marking TODO as done: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      gitlab_mark_all_todos_done: tool({
        description:
          'Mark all pending GitLab TODOs as done. WARNING: This operation affects ALL pending TODOs and cannot be undone.',
        args: {
          token: tool.schema.string().optional().describe('GitLab API token (overrides GITLAB_TOKEN env var)'),
          baseUrl: tool.schema.string().optional().describe('GitLab API base URL (overrides GITLAB_API_URL env var)'),
          timeout: tool.schema.number().optional().describe('Request timeout in milliseconds (default: 30000)'),
        },
        execute: async (args) => {
          try {
            const result = await gitlabMarkAllTodosDone(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error marking all TODOs as done: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      load_gitlab_skill: loadGitlabSkill,
    },
  };
};

export default GitLabPlugin;
