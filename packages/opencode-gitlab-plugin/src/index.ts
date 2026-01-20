/**
 * opencode-gitlab-plugin - GitLab integration plugin for OpenCode
 *
 * This is an OpenCode plugin scaffolded from the generator.
 * Replace this comment and implementation with your plugin's functionality.
 */

import type { Plugin } from '@opencode-ai/plugin';

/**
 * OpenCode plugin entry point
 *
 * This plugin is called when OpenCode loads. Use the ctx object to access
 * the OpenCode SDK client, shell commands, and workspace information.
 *
 * @example
 * ```typescript
 * export const OpencodeGitlabPlugin: Plugin = async (ctx) => {
 *   const { client, $, project, worktree } = ctx;
 *
 *   return {
 *     // Add tools, event handlers, hooks here
 *     event: async ({ event }) => {
 *       console.log('Event received:', event.type);
 *     },
 *   };
 * };
 * ```
 */
export const OpencodeGitlabPlugin: Plugin = async (ctx) => {
  const { project, worktree } = ctx;

  // Log plugin initialization
  console.log('[opencode-gitlab-plugin] Plugin loaded');
  console.log('[opencode-gitlab-plugin] Project:', project.id);
  console.log('[opencode-gitlab-plugin] Worktree:', worktree);

  // Return plugin hooks
  return {
    // Example: Handle session events
    event: async ({ event }) => {
      console.log('[opencode-gitlab-plugin] Event:', event.type);
    },

    // TODO: Add your plugin implementation here
    // - Tools: custom CLI tools for the AI (use ctx.client, ctx.$)
    // - Auth: authentication providers
    // - Hooks: chat.message, chat.params, permission.ask, etc.
  };
};
