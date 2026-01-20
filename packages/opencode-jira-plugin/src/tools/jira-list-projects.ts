import type { PluginInput } from '@opencode-ai/plugin';
import {
  success,
  failure,
  measureDuration,
  type PluginToolResponse,
  sendSuccessToast,
  sendErrorToast,
  formatDuration,
} from '@pantheon-org/opencode-core';
import { JiraClient } from './lib/client.js';
import type { Project } from './lib/types.js';

export interface ListProjectsArgs {
  search?: string;
  maxResults?: number;
  baseUrl?: string;
  email?: string;
  apiToken?: string;
}

export interface ListProjectsData {
  total: number;
  projects: Array<{
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
    archived: boolean;
  }>;
}

/**
 * List and search JIRA projects
 */
export default async function listProjects(
  args: ListProjectsArgs,
  toolCtx?: any,
): Promise<PluginToolResponse<ListProjectsData>> {
  const ctx = toolCtx as unknown as PluginInput;

  try {
    // Initialize JIRA client
    const client = new JiraClient({
      baseUrl: args.baseUrl,
      email: args.email,
      apiToken: args.apiToken,
    });

    const [projects, duration] = await measureDuration(async () => {
      if (args.search) {
        // Use paginated search endpoint for better filtering
        const result = await client.getProjectsPaginated(0, args.maxResults || 50, args.search);
        return result.values || [];
      } else {
        // Get all projects
        const allProjects = await client.getProjects();
        // Apply max results limit
        return allProjects.slice(0, args.maxResults || 50);
      }
    });

    // Transform projects for better readability
    const transformedProjects = projects.map((project) => ({
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
      archived: project.archived || false,
    }));

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'Projects Listed',
      `Found ${transformedProjects.length} project${transformedProjects.length === 1 ? '' : 's'}${args.search ? ` matching "${args.search}"` : ''} in ${formatDuration(duration)}`,
    );

    return success(
      {
        total: transformedProjects.length,
        projects: transformedProjects,
      },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    // Send error toast
    await sendErrorToast(
      ctx,
      toolCtx?.sessionID,
      'Failed to List Projects',
      'Check your JIRA credentials (baseUrl, email, apiToken).',
    );

    return failure(error instanceof Error ? error.message : 'Failed to list JIRA projects', {
      code: 'JIRA_LIST_PROJECTS_ERROR',
      context: {
        search: args.search,
        maxResults: args.maxResults,
      },
    });
  }
}
