/**
 * OpenCode Tool: List Snyk Organizations
 *
 * Lists all Snyk organizations accessible to the authenticated user.
 *
 * @param args - Tool arguments containing optional limit parameter
 * @returns Structured response with organizations and metadata
 *
 * @example
 * ```typescript
 * const result = await listOrganizations({ limit: 10 });
 * if (result.success) {
 *   console.log(result.data);
 *   // Output:
 *   // {
 *   //   organizations: [
 *   //     { id: "org-123", name: "My Organization", slug: "my-org" },
 *   //     { id: "org-456", name: "Another Org", slug: "another-org" }
 *   //   ],
 *   //   count: 2
 *   // }
 * }
 * ```
 */

import type { PluginInput } from '@opencode-ai/plugin';
import { createToolLogger, logOperationTiming } from '@pantheon-org/opencode-core';
import { failure, measureDuration, type PluginToolResponse, success } from '@pantheon-org/opencode-core';
import { formatDuration, sendErrorToast, sendSuccessToast } from '@pantheon-org/opencode-core';

import type { SnykOrganization } from './lib/index.ts';
import { createClientFromEnv, getOrganizations } from './lib/index.ts';

const log = createToolLogger('snyk', 'list-organizations');

export interface ListOrganizationsArgs {
  /** Maximum number of organizations to return */
  limit?: number;
}

export interface ListOrganizationsData {
  organizations: SnykOrganization[];
  count: number;
}

/**
 * List Snyk organizations
 *
 * Note: Uses environment variables SNYK_TOKEN and SNYK_API_URL for authentication.
 * These can be configured via `opencode auth` or set directly in your environment.
 */
const listOrganizations = async (
  args: ListOrganizationsArgs = {},
  toolCtx?: any,
): Promise<PluginToolResponse<ListOrganizationsData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  try {
    const client = createClientFromEnv();

    const [organizations, duration] = await measureDuration(() =>
      getOrganizations(client, {
        limit: args.limit || 100,
      }),
    );

    logOperationTiming(log, 'list-organizations', duration);

    // Send success toast with organization count
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'Organizations Listed',
      `Found ${organizations.length} Snyk organization${
        organizations.length === 1 ? '' : 's'
      } in ${formatDuration(duration)}`,
    );

    return success(
      {
        organizations,
        count: organizations.length,
      },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Failed to list organizations', {
      error: error instanceof Error ? error.message : String(error),
      limit: args.limit,
    });

    // Send error toast with guidance
    await sendErrorToast(
      ctx,
      toolCtx?.sessionID,
      'Failed to List Organizations',
      'Check your SNYK_TOKEN environment variable or run: opencode auth',
    );

    return failure(error instanceof Error ? error.message : 'Failed to list organizations', {
      code: 'SNYK_LIST_ORGS_ERROR',
      context: {
        limit: args.limit,
      },
    });
  }
};

export default listOrganizations;
