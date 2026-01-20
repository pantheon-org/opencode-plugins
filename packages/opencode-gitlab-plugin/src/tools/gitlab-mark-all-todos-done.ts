/**
 * OpenCode Tool: Mark All GitLab TODOs as Done
 *
 * Mark all pending TODOs as complete.
 */

import { createToolLogger, logOperationTiming } from '@libs/opencode-core/logger';
import { success, failure, measureDuration, type PluginToolResponse } from '@libs/opencode-core/response';
import { sendSuccessToast, sendErrorToast, formatDuration } from '@libs/opencode-core/session';
import type { PluginInput } from '@opencode-ai/plugin';

import { markAllTodosAsDone } from './lib/client.ts';

const log = createToolLogger('gitlab', 'mark-all-todos-done');

export interface MarkAllTodosDoneArgs {
  token?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface MarkAllTodosDoneData {
  completed: boolean;
}

const markAllTodosDone = async (
  args: MarkAllTodosDoneArgs = {},
  toolCtx?: any,
): Promise<PluginToolResponse<MarkAllTodosDoneData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  log.info('Marking all TODOs as done');

  try {
    const [, duration] = await measureDuration(() =>
      markAllTodosAsDone({
        token: args.token,
        baseUrl: args.baseUrl,
        timeout: args.timeout,
      }),
    );

    logOperationTiming(log, 'mark-all-todos-done', duration);

    log.info('All TODOs marked as done', { duration });

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'All TODOs Marked as Done',
      `All pending TODOs marked as done in ${formatDuration(duration)}`,
    );

    return success(
      { completed: true },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Failed to mark all TODOs as done', {
      error: error instanceof Error ? error.message : String(error),
    });

    // Send error toast
    await sendErrorToast(ctx, toolCtx?.sessionID, 'Failed to Mark TODOs', 'Check your GITLAB_TOKEN.');

    return failure(error instanceof Error ? error.message : 'Failed to mark all GitLab TODOs as done', {
      code: 'GITLAB_MARK_ALL_TODOS_DONE_ERROR',
    });
  }
};

export default markAllTodosDone;
