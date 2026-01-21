/**
 * OpenCode Tool: List GitLab Merge Requests
 *
 * Lists merge requests with flexible filtering options.
 *
 * @param args - Tool arguments containing filters
 * @returns Structured response with merge requests and metadata
 */

import { createToolLogger, logOperationTiming } from '@libs/opencode-core/logger';
import { success, failure, measureDuration, type PluginToolResponse } from '@libs/opencode-core/response';
import { sendSuccessToast, sendErrorToast, formatCount, formatDuration } from '@libs/opencode-core/session';
import type { PluginInput } from '@opencode-ai/plugin';

import { listMergeRequests as listMergeRequestsClient } from './lib/index.ts';
import type { GitLabMergeRequest } from './lib/types.ts';

const log = createToolLogger('gitlab', 'list-merge-requests');

export interface ListMergeRequestsArgs {
  projectId?: string | number;
  state?: string;
  author?: string;
  assignee?: string;
  targetBranch?: string;
  sourceBranch?: string;
  labels?: string | string[];
  perPage?: number;
  page?: number;
  baseUrl?: string;
  token?: string;
}

export interface ListMergeRequestsData {
  total: number;
  filters: Record<string, any>;
  mergeRequests: Array<{
    id: number;
    iid: number;
    title: string;
    description: string;
    state: string;
    url: string;
    projectId: number;
    author: { name: string; username: string };
    assignee: { name: string; username: string } | null;
    targetBranch: string;
    sourceBranch: string;
    labels: string[];
    createdAt: string;
    updatedAt: string;
    mergedAt: string | null;
    closedAt: string | null;
  }>;
}

const listMergeRequests = async (
  args: ListMergeRequestsArgs = {},
  toolCtx?: any,
): Promise<PluginToolResponse<ListMergeRequestsData>> => {
  log.info('Listing merge requests', {
    projectId: args.projectId,
    state: args.state,
  });

  // Get session context for toast notifications
  const ctx = toolCtx as unknown as PluginInput;
  const sessionID = toolCtx?.sessionID;

  try {
    // Validate state
    const validStates = ['opened', 'closed', 'locked', 'merged', 'all'];
    const state = args.state || 'all';
    if (!validStates.includes(state)) {
      log.error('Invalid state parameter', { state, validStates });

      // Send error toast for validation failure
      if (ctx && sessionID) {
        await sendErrorToast(ctx, sessionID, 'Invalid State', `State must be one of: ${validStates.join(', ')}`);
      }

      return failure(`Invalid state: ${state}. Must be one of: ${validStates.join(', ')}`, {
        code: 'GITLAB_INVALID_STATE',
        context: { state, validStates, sessionID },
      });
    }

    // Parse labels
    const labels = args.labels
      ? Array.isArray(args.labels)
        ? args.labels
        : args.labels.split(',').map((l: string) => l.trim())
      : undefined;

    const [result, duration] = await measureDuration(() =>
      listMergeRequestsClient(
        {
          baseUrl: args.baseUrl,
          token: args.token,
        },
        {
          projectId: args.projectId,
          state: state as any,
          authorUsername: args.author,
          assigneeUsername: args.assignee,
          targetBranch: args.targetBranch,
          sourceBranch: args.sourceBranch,
          labels,
          perPage: args.perPage || 20,
          page: args.page || 1,
        },
      ),
    );

    const transformedMRs = result.map((mr: GitLabMergeRequest) => ({
      id: mr.id,
      iid: mr.iid,
      title: mr.title,
      description: mr.description || '',
      state: mr.state,
      url: mr.web_url,
      projectId: mr.project_id,
      author: {
        name: mr.author.name,
        username: mr.author.username,
      },
      assignee: mr.assignee
        ? {
            name: mr.assignee.name,
            username: mr.assignee.username,
          }
        : null,
      targetBranch: mr.target_branch,
      sourceBranch: mr.source_branch,
      labels: mr.labels,
      createdAt: new Date(mr.created_at).toISOString().split('T')[0],
      updatedAt: new Date(mr.updated_at).toISOString().split('T')[0],
      mergedAt: mr.merged_at ? new Date(mr.merged_at).toISOString().split('T')[0] : null,
      closedAt: mr.closed_at ? new Date(mr.closed_at).toISOString().split('T')[0] : null,
    }));

    logOperationTiming(log, 'list-merge-requests', duration);

    log.info('Merge requests listed', {
      count: transformedMRs.length,
      duration,
    });

    // Send success toast with summary
    if (ctx && sessionID) {
      const stateFilter = state !== 'all' ? ` (${state})` : '';
      const message =
        transformedMRs.length === 0
          ? `No merge requests found${stateFilter}`
          : `Found ${formatCount(transformedMRs.length, 'merge request')}${stateFilter} in ${formatDuration(duration)}`;

      await sendSuccessToast(ctx, sessionID, 'Merge Requests Listed', message);
    }

    return success(
      {
        total: transformedMRs.length,
        filters: {
          projectId: args.projectId,
          state,
          author: args.author,
          assignee: args.assignee,
          targetBranch: args.targetBranch,
          sourceBranch: args.sourceBranch,
          labels: args.labels
            ? Array.isArray(args.labels)
              ? args.labels
              : args.labels.split(',').map((l: string) => l.trim())
            : undefined,
        },
        mergeRequests: transformedMRs,
      },
      {
        duration,
        sessionID,
        messageID: toolCtx?.messageID,
        pagination: {
          page: args.page || 1,
          perPage: args.perPage || 20,
          total: transformedMRs.length,
        },
      },
    );
  } catch (error) {
    log.error('Failed to list merge requests', {
      error: error instanceof Error ? error.message : String(error),
      projectId: args.projectId,
    });

    // Send error toast with actionable guidance
    if (ctx && sessionID) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const guidance =
        errorMessage.includes('401') || errorMessage.includes('authentication')
          ? 'Authentication failed. Check your GitLab token.'
          : errorMessage.includes('404') || errorMessage.includes('not found')
            ? args.projectId
              ? `Project '${args.projectId}' not found or no access.`
              : 'Project not found. Specify a valid project ID.'
            : errorMessage.includes('403') || errorMessage.includes('forbidden')
              ? 'Access denied. Check token permissions.'
              : `Error: ${errorMessage}`;

      await sendErrorToast(ctx, sessionID, 'Failed to List MRs', guidance);
    }

    return failure(error instanceof Error ? error.message : 'Failed to list GitLab merge requests', {
      code: 'GITLAB_LIST_MRS_ERROR',
      context: {
        projectId: args.projectId,
        state: args.state,
        sessionID,
      },
    });
  }
};

export default listMergeRequests;
