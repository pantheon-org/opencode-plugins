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
  formatCount,
  formatDuration,
} from '@pantheon-org/opencode-core';

import { createJiraClient } from './lib/client.js';
import type { IssueBean, SearchResults } from './lib/types.js';

const log = createToolLogger('jira', 'search-issues');

export interface SearchIssuesArgs {
  project?: string;
  status?: string;
  assignee?: string;
  reporter?: string;
  issueType?: string;
  priority?: string;
  maxResults?: number;
  mine?: boolean;
  baseUrl?: string;
  email?: string;
  apiToken?: string;
}

export interface SearchIssuesData {
  total: number;
  startAt: number;
  maxResults: number;
  jql: string;
  issues: Array<{
    key: string;
    summary?: string;
    status?: string;
    assignee?: string;
    reporter?: string;
    priority?: string;
    type?: string;
    project?: string;
    created?: string;
    updated?: string;
    url?: string;
  }>;
}

/**
 * Search JIRA issues using JQL filters
 */
const searchIssues = async (args: SearchIssuesArgs, toolCtx?: any): Promise<PluginToolResponse<SearchIssuesData>> => {
  log.info('Searching JIRA issues', {
    project: args.project,
    status: args.status,
    mine: args.mine,
  });

  // Get session context for toast notifications
  const ctx = toolCtx as unknown as PluginInput;
  const sessionID = toolCtx?.sessionID;

  try {
    // Initialize JIRA client
    const client = createJiraClient({
      baseUrl: args.baseUrl,
      email: args.email,
      apiToken: args.apiToken,
    });

    const [result, duration] = await measureDuration(async () => {
      // Build JQL query
      const jqlParts: string[] = [];

      if (args.mine) {
        jqlParts.push('assignee = currentUser()');
      } else {
        if (args.project) {
          jqlParts.push(`project = "${args.project}"`);
        }
        if (args.status) {
          jqlParts.push(`status = "${args.status}"`);
        }
        if (args.assignee) {
          jqlParts.push(`assignee = "${args.assignee}"`);
        }
        if (args.reporter) {
          jqlParts.push(`reporter = "${args.reporter}"`);
        }
        if (args.issueType) {
          jqlParts.push(`issuetype = "${args.issueType}"`);
        }
        if (args.priority) {
          jqlParts.push(`priority = "${args.priority}"`);
        }
      }

      const jql = jqlParts.length > 0 ? jqlParts.join(' AND ') + ' ORDER BY updated DESC' : 'ORDER BY updated DESC';

      // Search issues
      return await client.searchIssues({
        jql,
        fields: [
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
        ],
        maxResults: args.maxResults || 50,
      });
    });

    // Transform issues for better readability
    const issues = (result.issues || []).map((issue) => ({
      key: issue.key!,
      summary: issue.fields?.summary,
      status: issue.fields?.status?.name,
      assignee: issue.fields?.assignee?.displayName || 'Unassigned',
      reporter: issue.fields?.reporter?.displayName,
      priority: issue.fields?.priority?.name,
      type: issue.fields?.issuetype?.name,
      project: issue.fields?.project?.key,
      created: issue.fields?.created ? new Date(issue.fields.created).toISOString().split('T')[0] : undefined,
      updated: issue.fields?.updated ? new Date(issue.fields.updated).toISOString().split('T')[0] : undefined,
      url: issue.self,
    }));

    logOperationTiming(log, 'search-issues', duration);

    log.info('Issues search complete', {
      total: result.total,
      returned: issues.length,
      duration,
    });

    // Send success toast with count
    if (ctx && sessionID) {
      const message =
        issues.length === 0
          ? 'No issues found matching your criteria'
          : `Found ${formatCount(issues.length, 'issue')}${result.total && result.total > issues.length ? ` (${result.total} total)` : ''} in ${formatDuration(duration)}`;

      await sendSuccessToast(ctx, sessionID, 'Search Complete', message);
    }

    return success(
      {
        total: result.total || 0,
        startAt: result.startAt || 0,
        maxResults: result.maxResults || 0,
        jql: '', // JQL stored in closure
        issues,
      },
      { duration, sessionID, messageID: toolCtx?.messageID },
    );
  } catch (error) {
    log.error('Failed to search issues', {
      error: error instanceof Error ? error.message : String(error),
      project: args.project,
    });

    // Send error toast with actionable guidance
    if (ctx && sessionID) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const guidance =
        errorMessage.includes('401') || errorMessage.includes('authentication')
          ? 'Authentication failed. Check your JIRA credentials.'
          : errorMessage.includes('JQL') || errorMessage.includes('syntax')
            ? 'Invalid JQL query. Check your search filters.'
            : errorMessage.includes('project')
              ? `Project '${args.project}' not found or no access.`
              : `Error: ${errorMessage}`;

      await sendErrorToast(ctx, sessionID, 'Search Failed', guidance);
    }

    return failure(error instanceof Error ? error.message : 'Failed to search JIRA issues', {
      code: 'JIRA_SEARCH_ISSUES_ERROR',
      context: {
        project: args.project,
        status: args.status,
        sessionID,
      },
    });
  }
};

export default searchIssues;
