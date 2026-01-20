/**
 * OpenCode Tool: List Snyk Projects
 *
 * Lists all projects within a specified Snyk organization.
 *
 * @param args - Tool arguments with organizationId and optional limit
 * @returns Structured response with projects and metadata
 *
 * @example
 * ```typescript
 * const result = await listProjects({
 *   organizationId: "org-123",
 *   limit: 50
 * });
 * if (result.success) {
 *   console.log(result.data);
 *   // Output:
 *   // {
 *   //   organization: { id: "org-123", name: "My Org", slug: "my-org" },
 *   //   projects: [...],
 *   //   count: 1
 *   // }
 * }
 * ```
 */

import type { PluginInput } from '@opencode-ai/plugin';
import { failure, measureDuration, type PluginToolResponse, success } from '@pantheon-org/opencode-core';
import { createToolLogger, logOperationTiming } from '@pantheon-org/opencode-core';
import { formatDuration, sendErrorToast, sendSuccessToast } from '@pantheon-org/opencode-core';

import { createClientFromEnv, getOrganizations, getProjects } from './lib/index.ts';
import type { SnykOrganization, SnykProject } from './lib/index.ts';

const log = createToolLogger('snyk', 'list-projects');

export interface ListProjectsArgs {
  /** The organization ID to list projects for */
  organizationId: string;
  /** Maximum number of projects to return */
  limit?: number;
}

export interface ListProjectsData {
  organization: SnykOrganization;
  projects: SnykProject[];
  count: number;
}

const fetchOrganizationAndProjects = async (
  client: any,
  organizationId: string,
  limit: number,
): Promise<{ organization: SnykOrganization; projects: SnykProject[] }> => {
  const organizations = await getOrganizations(client);
  const organization = organizations.find((org) => org.id === organizationId);

  if (!organization) {
    throw new Error(`Organization not found: ${organizationId}`);
  }

  const projects = await getProjects(client, organizationId, { limit });
  return { organization, projects };
};

const formatProjectsMessage = (count: number, orgName: string, duration: number): string => {
  const plural = count === 1 ? '' : 's';
  return `Found ${count} project${plural} in ${orgName} (${formatDuration(duration)})`;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.includes('not found')) {
    return 'Organization not found. Use snyk_list_organizations to see available organizations.';
  }
  return 'Check your SNYK_TOKEN or organization ID.';
};

/**
 * List Snyk projects for an organization
 */
const listProjects = async (args: ListProjectsArgs, toolCtx?: any): Promise<PluginToolResponse<ListProjectsData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  if (!args.organizationId) {
    log.error('Missing required parameter', { param: 'organizationId' });
    await sendErrorToast(ctx, toolCtx?.sessionID, 'Missing Parameter', 'organizationId is required');
    return failure('organizationId is required', {
      code: 'SNYK_MISSING_PARAM',
      context: { param: 'organizationId' },
    });
  }

  log.info('Fetching projects', {
    organizationId: args.organizationId,
    limit: args.limit,
  });

  try {
    const client = createClientFromEnv();
    const [result, duration] = await measureDuration(() =>
      fetchOrganizationAndProjects(client, args.organizationId, args.limit || 100),
    );

    logOperationTiming(log, 'list-projects', duration);
    log.info('Projects fetched successfully', {
      count: result.projects.length,
      duration,
    });

    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'Projects Listed',
      formatProjectsMessage(result.projects.length, result.organization.name, duration),
    );

    return success(
      {
        organization: result.organization,
        projects: result.projects,
        count: result.projects.length,
      },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Failed to list projects', {
      error: error instanceof Error ? error.message : String(error),
      organizationId: args.organizationId,
    });

    await sendErrorToast(ctx, toolCtx?.sessionID, 'Failed to List Projects', getErrorMessage(error));

    return failure(error instanceof Error ? error.message : 'Failed to list projects', {
      code: 'SNYK_LIST_PROJECTS_ERROR',
      context: {
        organizationId: args.organizationId,
        limit: args.limit,
      },
    });
  }
};

export default listProjects;
