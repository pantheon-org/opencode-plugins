/**
 * OpenCode Tool: List GitLab TODOs
 *
 * Lists TODO items for the authenticated user with filtering options.
 */

import { createToolLogger, logOperationTiming } from '@libs/opencode-core/logger';
import { success, failure, measureDuration, type PluginToolResponse } from '@libs/opencode-core/response';
import { sendSuccessToast, sendErrorToast, formatDuration } from '@libs/opencode-core/session';
import type { PluginInput } from '@opencode-ai/plugin';

import { listTodos as listTodosClient } from './lib/index.ts';
import type { GitLabTodo } from './lib/types.ts';

const log = createToolLogger('gitlab', 'list-todos');

export interface ListTodosArgs {
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
  projectId?: number;
  authorId?: number;
  perPage?: number;
  page?: number;
  token?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface ListTodosData {
  todos: GitLabTodo[];
  count: number;
  summary: {
    pending: number;
    done: number;
  };
}

const listTodos = async (args: ListTodosArgs = {}, toolCtx?: any): Promise<PluginToolResponse<ListTodosData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  log.info('Listing TODOs', {
    state: args.state,
    action: args.action,
    targetType: args.targetType,
  });

  try {
    const [todos, duration] = await measureDuration(() =>
      listTodosClient(
        {
          token: args.token,
          baseUrl: args.baseUrl,
          timeout: args.timeout,
        },
        {
          state: args.state,
          action: args.action,
          targetType: args.targetType,
          projectId: args.projectId,
          authorId: args.authorId,
          perPage: args.perPage,
          page: args.page,
        },
      ),
    );

    const summary = {
      pending: todos.filter((t) => t.state === 'pending').length,
      done: todos.filter((t) => t.state === 'done').length,
    };

    logOperationTiming(log, 'list-todos', duration);

    log.info('TODOs listed successfully', {
      count: todos.length,
      pending: summary.pending,
      done: summary.done,
      duration,
    });

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'TODOs Listed',
      `Found ${todos.length} TODO${todos.length === 1 ? '' : 's'} (${summary.pending} pending, ${summary.done} done) in ${formatDuration(duration)}`,
    );

    return success(
      {
        todos,
        count: todos.length,
        summary,
      },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Failed to list TODOs', {
      error: error instanceof Error ? error.message : String(error),
      state: args.state,
    });

    // Send error toast
    await sendErrorToast(ctx, toolCtx?.sessionID, 'Failed to List TODOs', 'Check your GITLAB_TOKEN and API URL.');

    return failure(error instanceof Error ? error.message : 'Failed to list GitLab TODOs', {
      code: 'GITLAB_LIST_TODOS_ERROR',
      context: {
        state: args.state,
        action: args.action,
      },
    });
  }
};

export default listTodos;
