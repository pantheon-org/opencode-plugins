/**
 * OpenCode Tool: Mark GitLab TODO as Done
 *
 * Mark a specific TODO as complete.
 */

import { createToolLogger, logOperationTiming } from '@libs/opencode-core/logger';
import { success, failure, measureDuration, type PluginToolResponse } from '@libs/opencode-core/response';
import { sendSuccessToast, sendErrorToast, formatDuration } from '@libs/opencode-core/session';
import type { PluginInput } from '@opencode-ai/plugin';

import { markTodoAsDone } from './lib/index.ts';
import type { GitLabTodo } from './lib/types.ts';

const log = createToolLogger('gitlab', 'mark-todo-done');

export interface MarkTodoDoneArgs {
  todoId: number;
  token?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface MarkTodoDoneData {
  todo: GitLabTodo;
}

const markTodoDone = async (args: MarkTodoDoneArgs, toolCtx?: any): Promise<PluginToolResponse<MarkTodoDoneData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  log.info('Marking TODO as done', { todoId: args.todoId });

  try {
    const [todo, duration] = await measureDuration(() =>
      markTodoAsDone(
        {
          token: args.token,
          baseUrl: args.baseUrl,
          timeout: args.timeout,
        },
        args.todoId,
      ),
    );

    logOperationTiming(log, 'mark-todo-done', duration);

    log.info('TODO marked as done', {
      todoId: args.todoId,
      state: todo.state,
      duration,
    });

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'TODO Marked as Done',
      `TODO #${args.todoId} marked as done in ${formatDuration(duration)}`,
    );

    return success(
      { todo },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Failed to mark TODO as done', {
      error: error instanceof Error ? error.message : String(error),
      todoId: args.todoId,
    });

    // Send error toast
    await sendErrorToast(ctx, toolCtx?.sessionID, 'Failed to Mark TODO', 'Check your GITLAB_TOKEN and TODO ID.');

    return failure(error instanceof Error ? error.message : 'Failed to mark GitLab TODO as done', {
      code: 'GITLAB_MARK_TODO_DONE_ERROR',
      context: { todoId: args.todoId },
    });
  }
};

export default markTodoDone;
