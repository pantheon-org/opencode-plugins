/**
 * Send a progress message
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - TypeScript 5.3+ requires resolution-mode for ESM type imports in CJS context
import type { PluginInput } from '@opencode-ai/plugin';

import { createLogger } from '../logger/index';
import type { ProgressConfig } from '../types/session-types';

const log = createLogger({ plugin: 'shared', tool: 'session' });

/**
 * Send a progress message to the OpenCode session
 *
 * Displays a progress message in the session chat. Useful for long-running
 * operations to keep users informed. Messages are sent with `noReply: true`
 * so they don't trigger assistant responses.
 *
 * @param ctx - Plugin input context with client access
 * @param sessionID - Current session ID
 * @param progress - Progress configuration
 * @returns Promise that resolves when message is sent or logged
 *
 * @example
 * ```typescript
 * // Initial progress message
 * await sendProgress(ctx, toolCtx.sessionID, {
 *   text: 'Scanning dependencies...',
 * });
 *
 * // Progress update
 * await sendProgress(ctx, toolCtx.sessionID, {
 *   text: 'Analyzed 50/100 packages...',
 *   isUpdate: true,
 * });
 * ```
 */
export const sendProgress = async (ctx: PluginInput, sessionID: string, progress: ProgressConfig): Promise<void> => {
  try {
    // Send progress message to session
    await ctx.client.session.prompt({
      path: { id: sessionID },
      body: {
        noReply: true,
        parts: [{ type: 'text', text: progress.text }],
      },
    });

    log.debug('Progress message sent', {
      sessionID,
      text: progress.text,
      isUpdate: progress.isUpdate || false,
    });
  } catch (error) {
    // Graceful fallback: log the progress
    log.info(`Progress: ${progress.text}`, {
      sessionID,
      isUpdate: progress.isUpdate || false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
