/**
 * OpenCode Tool: Get GitLab TODO
 *
 * Get a specific TODO item by ID.
 */

import { createToolLogger, logOperationTiming } from '@libs/opencode-core/logger';
import { success, failure, measureDuration, type PluginToolResponse } from '@libs/opencode-core/response';
import { sendSuccessToast, sendErrorToast, formatDuration } from '@libs/opencode-core/session';
import type { PluginInput } from '@opencode-ai/plugin';

import { getTodo as getTodoClient } from './lib/index.ts';
import type { GitLabTodo } from './lib/types.ts';

const log = createToolLogger('gitlab', 'get-todo');

export interface GetTodoArgs {
  todoId: number;
  token?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface GetTodoData {
  todo: GitLabTodo;
}

const getTodo = async (args: GetTodoArgs, toolCtx?: any): Promise<PluginToolResponse<GetTodoData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  log.info('Fetching TODO', { todoId: args.todoId });

  try {
    const [todo, duration] = await measureDuration(() =>
      getTodoClient(
        {
          token: args.token,
          baseUrl: args.baseUrl,
          timeout: args.timeout,
        },
        args.todoId,
      ),
    );

    logOperationTiming(log, 'get-todo', duration);

    log.info('TODO fetched successfully', {
      todoId: args.todoId,
      state: todo.state,
      duration,
    });

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'TODO Retrieved',
      `TODO #${args.todoId} (${todo.state}) retrieved in ${formatDuration(duration)}`,
    );

    return success(
      { todo },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Failed to get TODO', {
      error: error instanceof Error ? error.message : String(error),
      todoId: args.todoId,
    });

    // Send error toast
    await sendErrorToast(ctx, toolCtx?.sessionID, 'Failed to Get TODO', 'Check your GITLAB_TOKEN and TODO ID.');

    return failure(error instanceof Error ? error.message : 'Failed to get GitLab TODO', {
      code: 'GITLAB_GET_TODO_ERROR',
      context: { todoId: args.todoId },
    });
  }
};

export default getTodo;
