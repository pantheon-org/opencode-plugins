/**
 * Send a toast notification
 */

// @ts-expect-error - TypeScript module resolution issue with Node16 and ESM packages
import type { PluginInput } from '@opencode-ai/plugin';

import { createLogger } from '../logger/index.js';
import type { ToastConfig } from '../types/session-types.js';

const log = createLogger({ plugin: 'shared', tool: 'session' });

/**
 * Send a toast notification to the OpenCode TUI
 *
 * Attempts to send a toast notification to the user. If the operation fails
 * (e.g., due to missing client context), logs the notification instead.
 *
 * @param ctx - Plugin input context with client access
 * @param sessionID - Current session ID
 * @param toast - Toast configuration
 * @returns Promise that resolves when toast is sent or logged
 *
 * @example
 * ```typescript
 * await sendToast(ctx, toolCtx.sessionID, {
 *   title: 'Scan Complete',
 *   message: 'Found 3 critical vulnerabilities',
 *   variant: 'warning',
 * });
 * ```
 */
export const sendToast = async (ctx: PluginInput, sessionID: string, toast: ToastConfig): Promise<void> => {
  try {
    // Attempt to send toast via TUI
    await ctx.client.tui.showToast({
      body: {
        title: toast.title,
        message: toast.message,
        variant: toast.variant,
        duration: toast.duration,
      },
    });

    log.debug('Toast notification sent', {
      sessionID,
      title: toast.title,
      variant: toast.variant,
    });
  } catch (error) {
    // Graceful fallback: log the notification
    const logMethod = toast.variant === 'error' ? 'error' : 'info';
    log[logMethod](`Toast: ${toast.title}`, {
      message: toast.message,
      variant: toast.variant,
      sessionID,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
