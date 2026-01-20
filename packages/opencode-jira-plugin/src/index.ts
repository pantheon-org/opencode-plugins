/**
 * JIRA OpenCode Plugin
 *
 * This plugin provides tools for interacting with the JIRA API to search issues,
 * manage projects, and retrieve detailed information.
 *
 * Environment Variables:
 * - JIRA_URL or JIRA_BASE_URL (required): Your JIRA instance URL (e.g., https://your-domain.atlassian.net)
 * - JIRA_EMAIL or JIRA_USERNAME (required): Your JIRA account email
 * - JIRA_API_TOKEN (required): Your JIRA API token
 *
 * Available Tools:
 * - jira_search_issues: Search issues using JQL filters (project, status, assignee, etc.)
 * - jira_get_issue: Get detailed information about a specific issue
 * - jira_list_projects: List all accessible projects
 * - jira_get_project: Get detailed information about a specific project
 */

import type { Plugin } from '@opencode-ai/plugin';
import { tool } from '@opencode-ai/plugin';
import { createLogger } from '@pantheon-org/opencode-core';

// Import tool implementations
import jiraGetIssue from './tools/jira-get-issue.js';
import jiraGetProject from './tools/jira-get-project.js';
import jiraListProjects from './tools/jira-list-projects.js';
import jiraSearchIssues from './tools/jira-search-issues.js';

// Create logger for the plugin
const log = createLogger({ plugin: 'jira' });

export const JiraPlugin: Plugin = async (ctx) => {
  return {
    event: async ({ event }) => {
      // Get event logging configuration
      const config = (ctx.client.config as any)?.jira?.events || { enabled: true };
      if (!config.enabled) return;

      // Log all events at debug level
      log.debug('OpenCode event received', {
        type: event.type,
        plugin: 'jira',
      });

      // Log JIRA issue references in messages
      if (config.issueReferences && event.type === 'message.updated') {
        const messageContent = (event as any).content || '';

        // Match JIRA issue pattern: 1+ uppercase letters, dash, 1+ digits
        // Examples: PROJ-123, DEV-1, ABC-9999
        const issuePattern = /\b[A-Z]{1,10}-\d+\b/g;
        const matches = messageContent.match(issuePattern);

        if (matches && matches.length > 0) {
          // Deduplicate matches
          const uniqueIssues = Array.from(new Set(matches));

          log.info('JIRA issue references detected in message', {
            issues: uniqueIssues,
            count: uniqueIssues.length,
            messageID: (event as any).messageID,
            note: 'Use jira_get_issue tool to view issue details',
          });
        }
      }

      if (config.sessionLifecycle && event.type === 'session.created') {
        log.info('New OpenCode session started', {
          sessionID: (event as any).sessionID,
          project: ctx.project.worktree,
        });
      }

      if (config.sessionLifecycle && event.type === 'session.idle') {
        log.debug('OpenCode session became idle', {
          sessionID: (event as any).sessionID,
        });
      }

      if (config.sessionLifecycle && event.type === 'session.error') {
        log.error('OpenCode session error', {
          sessionID: (event as any).sessionID,
          error: (event as any).error,
        });
      }
    },
    config: async (config) => {
      // Configure JIRA plugin with sensible defaults
      config.jira = {
        // Notification settings
        notifications: {
          enabled: true, // Master toggle for all notifications
          success: true, // Show success toasts (e.g., "Found 12 issues")
          error: true, // Show error toasts (e.g., "Invalid JQL syntax")
          progress: false, // JIRA operations are typically fast, progress rarely needed
        },

        // Event logging settings (for observability)
        events: {
          enabled: true, // Log OpenCode events
          issueReferences: true, // Log when JIRA issue keys (PROJ-123) are mentioned
          sessionLifecycle: false, // Log session create/delete events
        },

        // Tool behavior settings
        tools: {
          defaultMaxResults: 50, // Default number of results to return
          autoLinkIssues: false, // Auto-link issue keys in messages (future feature)
        },
      };
    },
    auth: {
      provider: 'jira',
      loader: async (authFunc, provider) => {
        // Load JIRA authentication from stored credentials
        const auth = await authFunc();
        if (auth.type === 'api') {
          // For JIRA, we need both email and API token
          // The key contains the API token, and we need email from provider or env
          const apiToken = (auth as any).key || (auth as any).access;
          const email = (provider as any).email || process.env.JIRA_EMAIL || process.env.JIRA_USERNAME;
          const baseUrl =
            (provider as any).provider !== 'jira'
              ? (provider as any).provider
              : process.env.JIRA_URL || process.env.JIRA_BASE_URL;

          if (!baseUrl) {
            throw new Error('JIRA base URL is required (set JIRA_URL environment variable)');
          }

          if (!email) {
            throw new Error('JIRA email is required (set JIRA_EMAIL environment variable)');
          }

          return {
            apiToken,
            email,
            baseUrl,
          };
        }
        throw new Error(`Unsupported auth type: ${auth.type}`);
      },
      methods: [
        {
          type: 'api',
          label: 'JIRA API Token',
          prompts: [
            {
              type: 'text',
              key: 'baseUrl',
              message: 'Enter your JIRA instance URL',
              placeholder: 'https://your-domain.atlassian.net',
              validate: (value) => {
                if (!value || value.trim().length === 0) {
                  return 'JIRA URL is required';
                }
                if (!value.startsWith('http://') && !value.startsWith('https://')) {
                  return 'URL must start with http:// or https://';
                }
                return undefined;
              },
            },
            {
              type: 'text',
              key: 'email',
              message: 'Enter your JIRA account email',
              placeholder: 'user@example.com',
              validate: (value) => {
                if (!value || value.trim().length === 0) {
                  return 'Email is required';
                }
                if (!value.includes('@')) {
                  return 'Please enter a valid email address';
                }
                return undefined;
              },
            },
            {
              type: 'text',
              key: 'token',
              message: 'Enter your JIRA API token',
              placeholder: 'Get your token from https://id.atlassian.com/manage-profile/security/api-tokens',
              validate: (value) => {
                if (!value || value.trim().length === 0) {
                  return 'API token is required';
                }
                return undefined;
              },
            },
          ],
          async authorize(inputs) {
            const baseUrl = inputs?.baseUrl;
            const email = inputs?.email;
            const token = inputs?.token;

            if (!baseUrl || !email || !token) {
              return { type: 'failed' };
            }

            // Store the token as key, email in provider field (custom format)
            return {
              type: 'success',
              key: token,
              provider: JSON.stringify({ baseUrl, email }),
            };
          },
        },
      ],
    },
    tool: {
      jira_search_issues: tool({
        description:
          'Search JIRA issues using JQL filters. Supports filtering by project, status, assignee, reporter, issue type, priority, and more. Returns issue summary with key details like status, assignee, and timestamps.',
        args: {
          project: tool.schema.string().optional().describe("Filter by project key (e.g., 'PROJ', 'DEV')"),
          status: tool.schema.string().optional().describe("Filter by status (e.g., 'In Progress', 'Done', 'To Do')"),
          assignee: tool.schema.string().optional().describe('Filter by assignee email or display name'),
          reporter: tool.schema.string().optional().describe('Filter by reporter email or display name'),
          issueType: tool.schema.string().optional().describe("Filter by issue type (e.g., 'Bug', 'Task', 'Story')"),
          priority: tool.schema.string().optional().describe("Filter by priority (e.g., 'High', 'Medium', 'Low')"),
          maxResults: tool.schema.number().optional().describe('Maximum number of results to return (default: 50)'),
          mine: tool.schema
            .boolean()
            .optional()
            .describe('If true, only return issues assigned to current user (default: false)'),
          baseUrl: tool.schema.string().optional().describe('JIRA instance URL (overrides JIRA_URL env var)'),
          email: tool.schema.string().optional().describe('JIRA email (overrides JIRA_EMAIL env var)'),
          apiToken: tool.schema.string().optional().describe('JIRA API token (overrides JIRA_API_TOKEN env var)'),
        },
        async execute(args) {
          try {
            const result = await jiraSearchIssues(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error searching issues: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      jira_get_issue: tool({
        description:
          'Get detailed information about a specific JIRA issue by key or ID. Returns comprehensive issue data including description, comments, assignee, reporter, status, priority, labels, components, and timestamps.',
        args: {
          issueKey: tool.schema.string().describe("JIRA issue key (e.g., 'PROJ-123') or ID"),
          fields: tool.schema
            .string()
            .optional()
            .describe('Comma-separated list of fields to include (default: all standard fields)'),
          expand: tool.schema
            .string()
            .optional()
            .describe("Comma-separated list of properties to expand (e.g., 'renderedFields,changelog')"),
          baseUrl: tool.schema.string().optional().describe('JIRA instance URL (overrides JIRA_URL env var)'),
          email: tool.schema.string().optional().describe('JIRA email (overrides JIRA_EMAIL env var)'),
          apiToken: tool.schema.string().optional().describe('JIRA API token (overrides JIRA_API_TOKEN env var)'),
        },
        async execute(args) {
          try {
            const result = await jiraGetIssue(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error getting issue: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      jira_list_projects: tool({
        description:
          'List all JIRA projects accessible to the user with optional search filtering. Returns project metadata including key, name, description, type, lead, and archive status.',
        args: {
          search: tool.schema
            .string()
            .optional()
            .describe('Search query to filter projects by name, key, or description'),
          maxResults: tool.schema.number().optional().describe('Maximum number of results to return (default: 50)'),
          baseUrl: tool.schema.string().optional().describe('JIRA instance URL (overrides JIRA_URL env var)'),
          email: tool.schema.string().optional().describe('JIRA email (overrides JIRA_EMAIL env var)'),
          apiToken: tool.schema.string().optional().describe('JIRA API token (overrides JIRA_API_TOKEN env var)'),
        },
        async execute(args) {
          try {
            const result = await jiraListProjects(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error listing projects: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),

      jira_get_project: tool({
        description:
          'Get detailed information about a specific JIRA project by key or ID. Returns comprehensive project data including description, lead, roles, archived status, and project type.',
        args: {
          projectKey: tool.schema.string().describe("JIRA project key (e.g., 'PROJ', 'DEV') or ID"),
          baseUrl: tool.schema.string().optional().describe('JIRA instance URL (overrides JIRA_URL env var)'),
          email: tool.schema.string().optional().describe('JIRA email (overrides JIRA_EMAIL env var)'),
          apiToken: tool.schema.string().optional().describe('JIRA API token (overrides JIRA_API_TOKEN env var)'),
        },
        async execute(args) {
          try {
            const result = await jiraGetProject(args);
            return JSON.stringify(result, null, 2);
          } catch (error) {
            return `Error getting project: ${error instanceof Error ? error.message : String(error)}`;
          }
        },
      }),
    },
  };
};

export default JiraPlugin;
