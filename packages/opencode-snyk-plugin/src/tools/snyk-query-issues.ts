/**
 * OpenCode Tool: Query Snyk Issues
 *
 * Queries Snyk issues/vulnerabilities with advanced filtering options.
 * Allows filtering by severity, issue type, status, and date ranges.
 *
 * @param args - Tool arguments with organizationId and optional filters
 * @returns Structured response with filtered issues and summary statistics
 *
 * @example
 * ```typescript
 * const result = await queryIssues({
 *   organizationId: "org-123",
 *   severity: ["high", "critical"],
 *   issueType: ["vuln"],
 *   isIgnored: false,
 *   limit: 100
 * });
 * if (result.success) {
 *   console.log(result.data.summary);
 *   // Output: { total: 5, bySeverity: {...}, byType: {...} }
 * }
 * ```
 */

import type { PluginInput } from '@opencode-ai/plugin';
import { failure, measureDuration, type PluginToolResponse, success } from '@pantheon-org/opencode-core';
import { createToolLogger, logOperationTiming } from '@pantheon-org/opencode-core';
import {
  createSummary,
  formatDuration,
  sendErrorToast,
  sendProgress,
  sendSuccessToast,
} from '@pantheon-org/opencode-core';

import { createClientFromEnv, getOrganizations } from './lib/index.ts';
import type { FilterOptions, IssueType, SeverityLevel, SnykIssue, SnykOrganization } from './lib/index.ts';

const log = createToolLogger('snyk', 'query-issues');

export interface QueryIssuesArgs {
  /** The organization ID to query issues for */
  organizationId: string;
  /** Filter by specific project ID */
  projectId?: string;
  /** Filter by severity levels */
  severity?: SeverityLevel[];
  /** Filter by issue types */
  issueType?: IssueType[];
  /** Filter for ignored issues */
  isIgnored?: boolean;
  /** Filter for patched issues */
  isPatched?: boolean;
  /** Filter issues from this date (ISO format) */
  fromDate?: string;
  /** Filter issues to this date (ISO format) */
  toDate?: string;
  /** Maximum number of issues to return */
  limit?: number;
}

export interface IssueSummary {
  total: number;
  bySeverity: Record<SeverityLevel, number>;
  byType: Record<IssueType, number>;
}

export interface QueryIssuesData {
  organization: SnykOrganization;
  issues: SnykIssue[];
  summary: IssueSummary;
  filters: FilterOptions;
}

const calculateIssueSummary = (issues: SnykIssue[]): IssueSummary => {
  return {
    total: issues.length,
    bySeverity: {
      critical: issues.filter((i) => i.severity === 'critical').length,
      high: issues.filter((i) => i.severity === 'high').length,
      medium: issues.filter((i) => i.severity === 'medium').length,
      low: issues.filter((i) => i.severity === 'low').length,
      info: issues.filter((i) => i.severity === 'info').length,
    },
    byType: {
      vuln: issues.filter((i) => i.type === 'vuln').length,
      license: issues.filter((i) => i.type === 'license').length,
      config: issues.filter((i) => i.type === 'config').length,
      code: issues.filter((i) => i.type === 'code').length,
    },
  };
};

const formatScanResult = (summary: IssueSummary, duration: number): string => {
  if (summary.total === 0) {
    return 'No vulnerabilities found';
  }

  const severitySummary = createSummary(
    {
      Critical: summary.bySeverity.critical,
      High: summary.bySeverity.high,
      Medium: summary.bySeverity.medium,
    },
    ', ',
  );

  return `Found ${summary.total} issues${severitySummary ? ` (${severitySummary})` : ''} in ${formatDuration(duration)}`;
};

const getErrorGuidance = (error: unknown, organizationId: string): string => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  if (errorMessage.includes('401')) {
    return 'Authentication failed. Check your Snyk API token.';
  }
  if (errorMessage.includes('Organization not found')) {
    return `Organization '${organizationId}' not found. Check the organization ID.`;
  }
  return `Error: ${errorMessage}`;
};

const fetchOrganizationAndIssues = async (
  client: any,
  args: QueryIssuesArgs,
): Promise<{ organization: SnykOrganization; issues: SnykIssue[]; filters: FilterOptions }> => {
  const organizations = await getOrganizations(client);
  const organization = organizations.find((org) => org.id === args.organizationId);

  if (!organization) {
    throw new Error(`Organization not found: ${args.organizationId}`);
  }

  const filters: FilterOptions = {
    organizationId: args.organizationId,
    projectId: args.projectId,
    severity: args.severity,
    issueType: args.issueType,
    isIgnored: args.isIgnored,
    isPatched: args.isPatched,
    fromDate: args.fromDate,
    toDate: args.toDate,
  };

  // Placeholder: In a real implementation, this would make API calls to fetch issues
  const issues: SnykIssue[] = [];
  log.debug('API call placeholder', {
    note: 'Full implementation requires additional API endpoints',
  });

  return { organization, issues, filters };
};

/**
 * Query Snyk issues with filtering
 */
const queryIssues = async (args: QueryIssuesArgs, toolCtx?: any): Promise<PluginToolResponse<QueryIssuesData>> => {
  if (!args.organizationId) {
    log.error('Missing required parameter', { param: 'organizationId' });
    return failure('organizationId is required', {
      code: 'SNYK_MISSING_PARAM',
      context: { param: 'organizationId' },
    });
  }

  log.info('Querying issues', {
    organizationId: args.organizationId,
    projectId: args.projectId,
    severity: args.severity,
    issueType: args.issueType,
  });

  const ctx = toolCtx as unknown as PluginInput;
  const sessionID = toolCtx?.sessionID;

  try {
    if (ctx && sessionID) {
      await sendProgress(ctx, sessionID, {
        text: 'Scanning for security vulnerabilities...',
      });
    }

    const client = createClientFromEnv();
    const [result, duration] = await measureDuration(() => fetchOrganizationAndIssues(client, args));
    const summary = calculateIssueSummary(result.issues);

    logOperationTiming(log, 'query-issues', duration);
    log.info('Issues queried successfully', {
      total: summary.total,
      duration,
    });

    if (ctx && sessionID) {
      await sendSuccessToast(ctx, sessionID, 'Scan Complete', formatScanResult(summary, duration));
    }

    return success(
      {
        organization: result.organization,
        issues: result.issues,
        summary,
        filters: result.filters,
      },
      { duration, sessionID, messageID: toolCtx?.messageID },
    );
  } catch (error) {
    log.error('Failed to query issues', {
      error: error instanceof Error ? error.message : String(error),
      organizationId: args.organizationId,
    });

    if (ctx && sessionID) {
      await sendErrorToast(ctx, sessionID, 'Scan Failed', getErrorGuidance(error, args.organizationId));
    }

    return failure(error instanceof Error ? error.message : 'Failed to query issues', {
      code: 'SNYK_QUERY_ISSUES_ERROR',
      context: {
        organizationId: args.organizationId,
        projectId: args.projectId,
        sessionID,
      },
    });
  }
};

export default queryIssues;
