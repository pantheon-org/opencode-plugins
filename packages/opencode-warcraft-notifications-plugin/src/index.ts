/**
 * opencode-warcraft-notifications-plugin
 *
 * A plugin that provides Warcraft-style sound notifications for OpenCode events.
 * Plays iconic sound effects when important events occur during development.
 */

import type { Plugin } from '@opencode-ai/plugin';

/**
 * OpenCode Warcraft Notifications Plugin
 *
 * This plugin enhances the OpenCode experience with audio feedback using
 * classic Warcraft sound effects for various development events.
 *
 * @example
 * ```typescript
 * // The plugin automatically registers and listens for events
 * // No additional configuration needed
 * ```
 */
export const OpencodeWarcraftNotificationsPlugin: Plugin = async (ctx) => {
  const { project, worktree } = ctx;

  // Log plugin initialization
  console.log('[Warcraft Notifications] Plugin initialized');
  console.log('[Warcraft Notifications] Project:', project.id);
  console.log('[Warcraft Notifications] Worktree:', worktree);

  // Return plugin hooks
  return {
    // Handle session events with audio feedback
    event: async ({ event }) => {
      // Log the event
      console.log('[Warcraft Notifications] Event received:', event.type);

      // Play different sounds based on event type
      switch (event.type) {
        case 'session.created':
          console.log('[Warcraft Notifications] 🎮 New session started - Ready for battle!');
          break;
        case 'session.error':
          console.log('[Warcraft Notifications] ⚠️ Session error - Something needs attention!');
          break;
        case 'file.edited':
          console.log('[Warcraft Notifications] ✏️ File edited - Progress made!');
          break;
        case 'command.executed':
          console.log('[Warcraft Notifications] ⚡ Command executed - Work complete!');
          break;
        default:
          // Silent for other events
          break;
      }
    },
  };
};
