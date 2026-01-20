/**
 * OpenCode Tool: List GitLab Repositories
 *
 * Lists GitLab repositories (projects) with optional filtering.
 *
 * @param args - Tool arguments containing optional filters
 * @returns Structured response with repositories and metadata
 *
 * @example
 * ```typescript
 * const result = await listRepos({ owned: true });
 * if (result.success) {
 *   console.log(result.data);
 *   // Output:
 *   // {
 *   //   repositories: [...],
 *   //   pagination: { page: 1, perPage: 20, total: 5 }
 *   // }
 * }
 * ```
 */

import { success, failure, measureDuration, type PluginToolResponse } from '@libs/opencode-core/response';
import { sendSuccessToast, sendErrorToast, formatDuration } from '@libs/opencode-core/session';
import type { PluginInput } from '@opencode-ai/plugin';

import { listRepositories } from './lib/index.ts';

export interface ListReposArgs {
  /** Only return repositories owned by the authenticated user */
  owned?: boolean;
  /** Only return repositories where the user is a member */
  membership?: boolean;
  /** Search query to filter repositories by name or description */
  search?: string;
  /** Number of results per page (default: 20, max: 100) */
  perPage?: number;
  /** Page number for pagination (default: 1) */
  page?: number;
  /** GitLab API base URL (overrides GITLAB_API_URL env var) */
  baseUrl?: string;
  /** GitLab API token (overrides GITLAB_TOKEN env var) */
  token?: string;
}

export interface ListReposData {
  repositories: Array<{
    id: number;
    name: string;
    fullPath: string;
    description: string;
    url: string;
    namespace: string;
    defaultBranch: string;
    visibility: string;
    archived: boolean;
    fork: boolean;
    stars: number;
    forks: number;
    createdAt: string;
    lastActivity: string;
  }>;
}

/**
 * List GitLab repositories
 */
const listRepos = async (args: ListReposArgs = {}, toolCtx?: any): Promise<PluginToolResponse<ListReposData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  try {
    const page = args.page || 1;
    const perPage = args.perPage || 20;

    const [repositories, duration] = await measureDuration(() =>
      listRepositories(
        {
          baseUrl: args.baseUrl,
          token: args.token,
        },
        {
          owned: args.owned,
          membership: args.membership,
          search: args.search,
          perPage,
          page,
        },
      ),
    );

    // Transform repositories for better readability
    const transformedRepos = repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullPath: repo.path_with_namespace,
      description: repo.description || '',
      url: repo.web_url,
      namespace: repo.namespace.name,
      defaultBranch: repo.default_branch,
      visibility: repo.visibility,
      archived: repo.archived,
      fork: repo.fork,
      stars: repo.stars_count,
      forks: repo.forks_count,
      createdAt: new Date(repo.created_at).toISOString().split('T')[0],
      lastActivity: new Date(repo.last_activity_at).toISOString().split('T')[0],
    }));

    // Send success toast
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'Repositories Listed',
      `Found ${transformedRepos.length} repositor${transformedRepos.length === 1 ? 'y' : 'ies'}${args.search ? ` matching "${args.search}"` : ''} in ${formatDuration(duration)}`,
    );

    return success(
      { repositories: transformedRepos },
      {
        duration,
        sessionID: toolCtx?.sessionID,
        pagination: {
          page,
          perPage,
          total: transformedRepos.length,
        },
      },
    );
  } catch (error) {
    // Send error toast
    await sendErrorToast(
      ctx,
      toolCtx?.sessionID,
      'Failed to List Repositories',
      'Check your GITLAB_TOKEN and API URL.',
    );

    return failure(error instanceof Error ? error.message : 'Failed to list GitLab repositories', {
      code: 'GITLAB_LIST_REPOS_ERROR',
      context: {
        owned: args.owned,
        membership: args.membership,
        search: args.search,
        page: args.page,
      },
    });
  }
};

export default listRepos;
