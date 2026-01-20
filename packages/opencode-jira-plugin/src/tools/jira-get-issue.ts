import type { PluginInput } from '@opencode-ai/plugin';
import {
  success,
  failure,
  measureDuration,
  type PluginToolResponse,
  createToolLogger,
  logOperationTiming,
  sendSuccessToast,
  sendErrorToast,
  formatDuration,
} from '@pantheon-org/opencode-core';

import { JiraClient } from './lib/client.js';
import type { IssueBean } from './lib/types.js';

const log = createToolLogger('jira', 'get-issue');

export interface GetIssueArgs {
  issueKey: string;
  fields?: string;
  expand?: string;
  baseUrl?: string;
  email?: string;
  apiToken?: string;
}

export interface GetIssueData {
  issue: {
    key: string;
    id: string;
    self: string;
    summary?: string;
    description?: string;
    status?: string;
    assignee?:
      | {
          name: string;
          email: string;
          accountId: string;
        }
      | 'Unassigned';
    reporter?: {
      name: string;
      email: string;
      accountId: string;
    };
    priority?: string;
    type?: string;
    project?: {
      key: string;
      name: string;
    };
    labels?: string[];
    components?: string[];
    created?: string;
    updated?: string;
    otherFields?: Record<string, any>;
  };
}

/**
 * Get a single JIRA issue by key or ID
 */
const getIssue = async (args: GetIssueArgs, toolCtx?: any): Promise<PluginToolResponse<GetIssueData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  log.info('Fetching JIRA issue', { issueKey: args.issueKey });

  try {
    const [issue, duration] = await measureDuration(async () => {
      // Initialize JIRA client
      const client = new JiraClient({
        baseUrl: args.baseUrl,
        email: args.email,
        apiToken: args.apiToken,
      });

      // Parse fields if provided
      const fields = args.fields
        ? args.fields.split(',').map((f: string) => f.trim())
        : [
            'summary',
            'status',
            'assignee',
            'reporter',
            'priority',
            'issuetype',
            'project',
            'created',
            'updated',
            'description',
            'labels',
            'components',
          ];

      // Parse expand if provided
      const expand = args.expand ? args.expand.split(',').map((e: string) => e.trim()) : undefined;

      // Get issue
      return await client.getIssue(args.issueKey, fields, expand);
    });

    // Transform issue for better readability
    const transformedIssue = {
      key: issue.key!,
      id: issue.id!,
      self: issue.self!,
      summary: issue.fields?.summary,
      description: issue.fields?.description,
      status: issue.fields?.status?.name,
      assignee: issue.fields?.assignee
        ? {
            name: issue.fields.assignee.displayName!,
            email: issue.fields.assignee.emailAddress!,
            accountId: issue.fields.assignee.accountId!,
          }
        : ('Unassigned' as const),
      reporter: issue.fields?.reporter
        ? {
            name: issue.fields.reporter.displayName!,
            email: issue.fields.reporter.emailAddress!,
            accountId: issue.fields.reporter.accountId!,
          }
        : undefined,
      priority: issue.fields?.priority?.name,
      type: issue.fields?.issuetype?.name,
      project: issue.fields?.project
        ? {
            key: issue.fields.project.key!,
            name: issue.fields.project.name!,
          }
        : undefined,
      labels: issue.fields?.labels || [],
      components: issue.fields?.components?.map((c: any) => c.name) || [],
      created: issue.fields?.created ? new Date(issue.fields.created).toISOString() : undefined,
      updated: issue.fields?.updated ? new Date(issue.fields.updated).toISOString() : undefined,
      // Include all other fields that might be present
      otherFields: Object.keys(issue.fields || {})
        .filter(
          (key) =>
            ![
              'summary',
              'description',
              'status',
              'assignee',
              'reporter',
              'priority',
              'issuetype',
              'project',
              'labels',
              'components',
              'created',
              'updated',
            ].includes(key),
        )
        .reduce(
          (acc, key) => {
            acc[key] = issue.fields?.[key];
            return acc;
          },
          {} as Record<string, any>,
        ),
    };

    logOperationTiming(log, 'get-issue', duration);

    log.info('Issue retrieved successfully', {
      issueKey: issue.key,
      duration,
    });

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'Issue Retrieved',
      `${issue.key}: ${transformedIssue.summary || 'No summary'} in ${formatDuration(duration)}`,
    );

    return success(
      { issue: transformedIssue },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Failed to get issue', {
      error: error instanceof Error ? error.message : String(error),
      issueKey: args.issueKey,
    });

    // Send error toast
    await sendErrorToast(ctx, toolCtx?.sessionID, 'Failed to Get Issue', 'Check issue key and JIRA credentials.');

    return failure(error instanceof Error ? error.message : `Failed to get JIRA issue: ${args.issueKey}`, {
      code: 'JIRA_GET_ISSUE_ERROR',
      context: { issueKey: args.issueKey },
    });
  }
}

};

export default getIssue;
