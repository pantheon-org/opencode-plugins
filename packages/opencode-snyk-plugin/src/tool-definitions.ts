/**
 * Tool definitions for the Snyk plugin
 */

import { tool } from '@opencode-ai/plugin';

import loadSnykSkill from './tools/load-snyk-skill';
import snykAnalyzeDependencies from './tools/snyk-analyze-dependencies';
import snykGenerateSBOM from './tools/snyk-generate-sbom';
import snykListOrganizations from './tools/snyk-list-organizations';
import snykListProjects from './tools/snyk-list-projects';
import snykQueryIssues from './tools/snyk-query-issues';
import snykSBOMTest from './tools/snyk-sbom-test';

/**
 * All Snyk plugin tools
 */
export const snykTools: Record<string, ReturnType<typeof tool>> = {
  snyk_list_organizations: tool({
    description:
      'List all Snyk organizations accessible to the authenticated user. Returns organization id, name, and slug.',
    args: {
      limit: tool.schema.number().optional().describe('Maximum number of organizations to return (default: 100)'),
    },
    execute: async (args) => {
      try {
        const result = await snykListOrganizations({
          limit: args.limit,
        });
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error listing organizations: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  }),

  snyk_list_projects: tool({
    description:
      'List projects within a specific Snyk organization. Returns project details including id, name, origin, type, and creation date.',
    args: {
      organizationId: tool.schema.string().describe('The Snyk organization ID (get from snyk_list_organizations)'),
      limit: tool.schema.number().optional().describe('Maximum number of projects to return (default: 100)'),
    },
    execute: async (args) => {
      try {
        const result = await snykListProjects({
          organizationId: args.organizationId,
          limit: args.limit,
        });
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error listing projects: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  }),

  snyk_query_issues: tool({
    description:
      'Query and filter Snyk security issues/vulnerabilities for a specific project. Returns detailed issue information including severity, type, CVE identifiers, and affected packages.',
    args: {
      organizationId: tool.schema.string().describe('The Snyk organization ID (get from snyk_list_organizations)'),
      projectId: tool.schema.string().optional().describe('The Snyk project ID (get from snyk_list_projects)'),
      severity: tool.schema
        .array(tool.schema.enum(['critical', 'high', 'medium', 'low', 'info']))
        .optional()
        .describe('Filter by severity levels (array of severity values)'),
      issueType: tool.schema
        .array(tool.schema.enum(['vuln', 'license', 'config', 'code']))
        .optional()
        .describe('Filter by issue types (array of issue types)'),
      limit: tool.schema.number().optional().describe('Maximum number of issues to return (default: 100)'),
    },
    execute: async (args) => {
      try {
        const result = await snykQueryIssues({
          organizationId: args.organizationId,
          projectId: args.projectId,
          severity: args.severity,
          issueType: args.issueType,
          limit: args.limit,
        });
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error querying issues: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  }),

  snyk_analyze_dependencies: tool({
    description:
      'Analyze project dependencies and generate Package URLs (PURLs) for each package with issues. Provides detailed vulnerability analysis with PURL format for dependency tracking.',
    args: {
      organizationId: tool.schema.string().describe('The Snyk organization ID (get from snyk_list_organizations)'),
      projectId: tool.schema.string().describe('The Snyk project ID (get from snyk_list_projects)'),
      minSeverity: tool.schema
        .enum(['critical', 'high', 'medium', 'low', 'info'])
        .optional()
        .describe('Filter by minimum severity level'),
      limit: tool.schema.number().optional().describe('Maximum number of results'),
      offset: tool.schema.number().optional().describe('Result offset for pagination'),
    },
    execute: async (args) => {
      try {
        const result = await snykAnalyzeDependencies({
          organizationId: args.organizationId,
          projectId: args.projectId,
          options: {
            minSeverity: args.minSeverity,
            limit: args.limit,
            offset: args.offset,
          },
        });
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error analyzing dependencies: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  }),

  snyk_generate_sbom: tool({
    description:
      'Generate a Software Bill of Materials (SBOM) for a project. Supports multiple formats (CycloneDX JSON/XML, SPDX JSON). SBOM provides a comprehensive inventory of all components and dependencies.',
    args: {
      organizationId: tool.schema.string().describe('The Snyk organization ID (get from snyk_list_organizations)'),
      projectId: tool.schema.string().describe('The Snyk project ID (get from snyk_list_projects)'),
      format: tool.schema
        .enum([
          'cyclonedx1.4+json',
          'cyclonedx1.4+xml',
          'cyclonedx1.5+json',
          'cyclonedx1.5+xml',
          'cyclonedx1.6+json',
          'cyclonedx1.6+xml',
          'spdx2.3+json',
        ])
        .optional()
        .describe('SBOM format (default: cyclonedx1.6+json)'),
      excludeLicenses: tool.schema.boolean().optional().describe('Exclude license information from SBOM'),
    },
    execute: async (args) => {
      try {
        const result = await snykGenerateSBOM({
          organizationId: args.organizationId,
          projectId: args.projectId,
          format: args.format,
          excludeLicenses: args.excludeLicenses,
        });
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error generating SBOM: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  }),

  snyk_sbom_test: tool({
    description:
      'Manage SBOM test operations (async SBOM generation and testing). Operations: start - initiate test, status - check progress, results - get completed test results.',
    args: {
      operation: tool.schema.enum(['start', 'status', 'results']).describe('Operation to perform'),
      organizationId: tool.schema.string().describe('The Snyk organization ID'),
      jobId: tool.schema.string().optional().describe('Job ID for status/results operations'),
      testData: tool.schema
        .record(tool.schema.string(), tool.schema.any())
        .optional()
        .describe('Test data for start operation'),
    },
    execute: async (args) => {
      try {
        const result = await snykSBOMTest({
          operation: args.operation,
          organizationId: args.organizationId,
          jobId: args.jobId,
          testData: args.testData,
        });
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return `Error in SBOM test operation: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  }),

  load_snyk_skill: loadSnykSkill,
} as const;
