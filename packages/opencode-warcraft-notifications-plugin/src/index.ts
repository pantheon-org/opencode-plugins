/**
 * opencode-warcraft-notifications-plugin - warcraft notifications plugins for opencode
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
 * export const OpencodeWarcraftNotificationsPlugin: Plugin = async (ctx) => {
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
export const OpencodeWarcraftNotificationsPlugin: Plugin = async (ctx) => {
  const { client, $, project, worktree } = ctx;

  // Log plugin initialization
  console.log('[opencode-warcraft-notifications-plugin] Plugin loaded');
  console.log('[opencode-warcraft-notifications-plugin] Project:', project.id);
  console.log('[opencode-warcraft-notifications-plugin] Worktree:', worktree);

  // Return plugin hooks
  return {
    // Example: Handle session events
    event: async ({ event }) => {
      console.log('[opencode-warcraft-notifications-plugin] Event:', event.type);
    },

    // TODO: Add your plugin implementation here
    // - Tools: custom CLI tools for the AI
    // - Auth: authentication providers
    // - Hooks: chat.message, chat.params, permission.ask, etc.
  };
};
