/**
 * Toast Notification Utilities
 *
 * Helper functions for sending toast notifications via the OpenCode client.
 * All functions gracefully handle failures by silently catching errors.
 */

import type { OpencodeClient } from '@opencode-ai/sdk';

/**
 * Send an info toast notification
 *
 * @param client - OpenCode SDK client instance
 * @param title - Toast title
 * @param message - Toast message content
 */
export async function sendInfo(client: OpencodeClient, title: string, message: string): Promise<void> {
  try {
    await client.tui.showToast({
      body: {
        title,
        message,
        variant: 'info' as const,
        duration: 4000,
      },
    });
  } catch {
    // Silently fail - toast not critical
  }
}

/**
 * Send a success toast notification
 *
 * @param client - OpenCode SDK client instance
 * @param title - Toast title
 * @param message - Toast message content
 */
export async function sendSuccess(client: OpencodeClient, title: string, message: string): Promise<void> {
  try {
    await client.tui.showToast({
      body: {
        title,
        message,
        variant: 'success' as const,
        duration: 3000,
      },
    });
  } catch {
    // Silently fail - toast not critical
  }
}

/**
 * Send a warning toast notification
 *
 * @param client - OpenCode SDK client instance
 * @param title - Toast title
 * @param message - Toast message content
 */
export async function sendWarning(client: OpencodeClient, title: string, message: string): Promise<void> {
  try {
    await client.tui.showToast({
      body: {
        title,
        message,
        variant: 'warning' as const,
        duration: 5000,
      },
    });
  } catch {
    // Silently fail - toast not critical
  }
}
