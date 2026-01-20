/**
 * Analyze project dependencies for vulnerabilities using Snyk
 * Tool: snyk-analyze-dependencies
 */

import type { PluginInput } from '@opencode-ai/plugin';
import { createToolLogger, logOperationTiming } from '@pantheon-org/opencode-core';
import { failure, measureDuration, type PluginToolResponse, success } from '@pantheon-org/opencode-core';
import { createSummary, formatDuration, sendErrorToast, sendSuccessToast } from '@pantheon-org/opencode-core';

import { createClient, listIssues } from './lib/index.ts';
import type {
  DependencyAnalysisOptions,
  DependencyAnalysisSummary,
  PackageIssueWithPurl,
  SeverityLevel,
  SnykIssue,
} from './lib/types.ts';

const log = createToolLogger('snyk', 'analyze-dependencies');

/**
 * Tool parameters for dependency analysis
 */
export interface AnalyzeDependenciesParams {
  /**
   * Snyk organization ID
   */
  organizationId: string;

  /**
   * Snyk project ID
   */
  projectId: string;

  /**
   * Analysis options
   */
  options?: DependencyAnalysisOptions;

  /**
   * Snyk API token (if not set in environment)
   * Defaults to process.env.SNYK_TOKEN
   */
  token?: string;

  /**
   * Snyk API base URL
   * Defaults to 'https://api.snyk.io'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds
   * Defaults to 30000
   */
  timeout?: number;
}

/**
 * Tool result for dependency analysis
 */
interface AnalyzeDependenciesData {
  /** Array of packages with vulnerabilities including PURL identifiers */
  packages: PackageIssueWithPurl[];
  /** Summary of vulnerabilities by severity */
  summary: DependencyAnalysisSummary;
  /** Organization ID */
  organizationId: string;
  /** Project ID */
  projectId: string;
}

/**
 * Analyze project dependencies for security vulnerabilities
 *
 * This tool retrieves all issues for a Snyk project and generates
 * Package URLs (PURLs) for each vulnerable dependency. It provides
 * a summary of vulnerabilities grouped by severity level.
 *
 * @param params - Organization ID, Project ID, and analysis options
 * @returns Structured response with vulnerable packages, PURLs and severity summary
 *
 * @example
 * ```typescript
 * // Analyze all dependencies
 * const result = await analyzeDependencies({
 *   organizationId: 'org-id',
 *   projectId: 'project-id'
 * });
 * if (result.success) {
 *   console.log(result.data.summary);
 * }
 *
 * // Filter by severity
 * const highSeverity = await analyzeDependencies({
 *   organizationId: 'org-id',
 *   projectId: 'project-id',
 *   options: { minSeverity: 'high' }
 * });
 * ```
 */
export const analyzeDependencies = async (
  params: AnalyzeDependenciesParams,
  toolCtx?: any,
): Promise<PluginToolResponse<AnalyzeDependenciesData>> => {
  const ctx = toolCtx as unknown as PluginInput;

  log.info('Starting dependency analysis', {
    organizationId: params.organizationId,
    projectId: params.projectId,
    minSeverity: params.options?.minSeverity,
  });

  try {
    const client = createClient({
      token: params.token,
      baseUrl: params.baseUrl,
      timeout: params.timeout,
    });

    const [result, duration] = await measureDuration(async () => {
      // Fetch issues for the project
      const issues = await listIssues(client, {
        organizationId: params.organizationId,
        projectId: params.projectId,
        issueType: params.options?.vulnerabilityTypes,
      });

      // Filter issues that have package information
      let packages: PackageIssueWithPurl[] = issues
        .filter(
          (
            issue,
          ): issue is SnykIssue & {
            package_name: string;
            package_manager: string;
          } => Boolean(issue.package_name && issue.package_manager),
        )
        .map(
          (issue): PackageIssueWithPurl => ({
            ...issue,
            id: issue.id,
            title: issue.title,
            type: issue.type,
            severity: issue.severity,
            url: issue.url,
            description: issue.description,
            introduced_date: issue.introduced_date,
            purl: generatePurlFromIssue(issue),
            key: issue.id,
            effectiveSeverityLevel: issue.severity as SeverityLevel,
            status: 'open' as const,
            ignored: issue.is_ignored || false,
            tool: 'snyk',
            createdAt: issue.introduced_date,
            updatedAt: issue.introduced_date,
          }),
        );

      // Apply severity filter if specified
      if (params.options?.minSeverity) {
        const minSeverity = params.options.minSeverity;
        const severityOrder: SeverityLevel[] = ['info', 'low', 'medium', 'high', 'critical'];
        const minIndex = severityOrder.indexOf(minSeverity);
        packages = packages.filter((pkg) => severityOrder.indexOf(pkg.effectiveSeverityLevel) >= minIndex);
      }

      // Apply limit if specified
      if (params.options?.limit) {
        const offset = params.options.offset || 0;
        packages = packages.slice(offset, offset + params.options.limit);
      }

      return packages;
    });

    // Calculate summary by severity
    const summary: DependencyAnalysisSummary = {
      total: result.length,
      critical: result.filter((p) => p.effectiveSeverityLevel === 'critical').length,
      high: result.filter((p) => p.effectiveSeverityLevel === 'high').length,
      medium: result.filter((p) => p.effectiveSeverityLevel === 'medium').length,
      low: result.filter((p) => p.effectiveSeverityLevel === 'low').length,
      info: result.filter((p) => p.effectiveSeverityLevel === 'info').length,
    };

    logOperationTiming(log, 'analyze-dependencies', duration);

    log.info('Dependency analysis complete', {
      totalPackages: summary.total,
      critical: summary.critical,
      high: summary.high,
      duration,
    });

    // Send success toast with vulnerability summary
    const summaryText = createSummary(summary as unknown as Record<string, number>);
    await sendSuccessToast(
      ctx,
      toolCtx?.sessionID,
      'Dependency Analysis Complete',
      `Analyzed dependencies with ${summaryText} in ${formatDuration(duration)}`,
    );

    return success(
      {
        packages: result,
        summary,
        organizationId: params.organizationId,
        projectId: params.projectId,
      },
      {
        duration,
        sessionID: toolCtx?.sessionID,
      },
    );
  } catch (error) {
    log.error('Dependency analysis failed', {
      error: error instanceof Error ? error.message : String(error),
      organizationId: params.organizationId,
      projectId: params.projectId,
    });

    // Send error toast with guidance
    await sendErrorToast(
      ctx,
      toolCtx?.sessionID,
      'Dependency Analysis Failed',
      'Check your SNYK_TOKEN and verify project exists. Use snyk_list_projects first.',
    );

    return failure(error instanceof Error ? error.message : 'Failed to analyze dependencies', {
      code: 'SNYK_ANALYZE_DEPS_ERROR',
      context: {
        organizationId: params.organizationId,
        projectId: params.projectId,
      },
    });
  }
};

/**
 * Generate a Package URL (PURL) from a Snyk issue
 *
 * @param issue - Snyk issue containing package information
 * @returns PURL string
 */
const generatePurlFromIssue = (issue: { package_name?: string; package_manager?: string }): string => {
  if (!issue.package_name) {
    return '';
  }

  const purlTypeMap: Record<string, string> = {
    npm: 'npm',
    yarn: 'npm',
    maven: 'maven',
    gradle: 'maven',
    pip: 'pypi',
    poetry: 'pypi',
    gem: 'gem',
    composer: 'composer',
    nuget: 'nuget',
    go: 'golang',
    cargo: 'cargo',
  };

  const packageManager = issue.package_manager?.toLowerCase() || 'unknown';
  const purlType = purlTypeMap[packageManager] || packageManager;

  const packageName = issue.package_name;

  // Special handling for Maven group/artifact format
  if (purlType === 'maven' && packageName.includes('/')) {
    const [group, artifact] = packageName.split('/');
    return `pkg:maven/${group}/${artifact}`;
  }

  return `pkg:${purlType}/${packageName}`;
};

// Export as default for Bun tool loading
export default analyzeDependencies;
