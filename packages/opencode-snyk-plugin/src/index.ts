/**
 * Snyk OpenCode Plugin
 *
 * This plugin provides tools for interacting with the Snyk API to manage
 * security vulnerabilities, dependencies, and SBOMs.
 *
 * Environment Variables:
 * - SNYK_TOKEN (required): Your Snyk API token from https://app.snyk.io/account
 * - SNYK_API_URL (optional): Custom Snyk API URL (defaults to https://api.snyk.io)
 *
 * Available Tools:
 * - snyk_list_organizations: List all accessible Snyk organizations
 * - snyk_list_projects: List projects within a Snyk organization
 * - snyk_query_issues: Query and filter Snyk issues/vulnerabilities
 * - snyk_analyze_dependencies: Analyze project dependencies with PURL generation
 * - snyk_generate_sbom: Generate Software Bill of Materials (SBOM)
 * - snyk_sbom_test: Manage SBOM test operations (start/status/results)
 * - load_snyk_skill: Load comprehensive Snyk security skill for agents
 */

import type { Plugin } from '@opencode-ai/plugin';

import { snykAuthConfig } from './auth-config';
import { handlePluginEvent } from './event-handlers';
import { snykTools } from './tool-definitions';

export const SnykPlugin: Plugin = async (ctx) => {
  return {
    event: async ({ event }) => handlePluginEvent(ctx, event),
    auth: snykAuthConfig,
    tool: snykTools,
  };
};

export default SnykPlugin;
