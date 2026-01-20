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

import { createJiraClient } from './lib/client.js';
import type { Project } from './lib/types.js';

const log = createToolLogger('jira', 'get-project');

export interface GetProjectArgs {
  projectKey: string;
  baseUrl?: string;
  email?: string;
  apiToken?: string;
}

export interface GetProjectData {
  project: {
    key: string;
    name: string;
    id: string;
    description: string;
    type?: string;
    style?: string;
    lead?: {
      name: string;
      email: string;
      accountId: string;
    };
    url?: string;
    email?: string;
    archived: boolean;
    archivedDate?: string;
    archivedBy?: {
      name: string;
      accountId: string;
    };
    roles?: Record<string, string>;
    isPrivate?: boolean;
  };
}

/**
 * Get a single JIRA project by key or ID
 */
const getProject = async (args: GetProjectArgs, toolCtx?: any): Promise<PluginToolResponse<GetProjectData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  log.info('Fetching JIRA project', { projectKey: args.projectKey });

  try {
    const [project, duration] = await measureDuration(async () => {
      // Initialize JIRA client
      const client = createJiraClient({
        baseUrl: args.baseUrl,
        email: args.email,
        apiToken: args.apiToken,
      });

      // Get project
      return await client.getProject(args.projectKey);
    });

    // Transform project for better readability
    const transformedProject = {
      key: project.key!,
      name: project.name!,
      id: project.id!,
      description: project.description || '',
      type: project.projectTypeKey,
      style: project.style,
      lead: project.lead
        ? {
            name: project.lead.displayName!,
            email: project.lead.emailAddress!,
            accountId: project.lead.accountId!,
          }
        : undefined,
      url: project.url || project.self,
      email: project.email,
      archived: project.archived || false,
      archivedDate: project.archivedDate,
      archivedBy: project.archivedBy
        ? {
            name: project.archivedBy.displayName!,
            accountId: project.archivedBy.accountId!,
          }
        : undefined,
      roles: project.roles,
      isPrivate: project.isPrivate,
    };

    logOperationTiming(log, 'get-project', duration);

    log.info('Project retrieved successfully', {
      projectKey: project.key,
      duration,
    });

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'Project Retrieved',
      `${transformedProject.key}: ${transformedProject.name} in ${formatDuration(duration)}`,
    );

    return success(
      { project: transformedProject },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Failed to get project', {
      error: error instanceof Error ? error.message : String(error),
      projectKey: args.projectKey,
    });

    // Send error toast
    await sendErrorToast(ctx, toolCtx?.sessionID, 'Failed to Get Project', 'Check project key and JIRA credentials.');

    return failure(error instanceof Error ? error.message : `Failed to get JIRA project: ${args.projectKey}`, {
      code: 'JIRA_GET_PROJECT_ERROR',
      context: { projectKey: args.projectKey },
    });
  }
};

export default getProject;
