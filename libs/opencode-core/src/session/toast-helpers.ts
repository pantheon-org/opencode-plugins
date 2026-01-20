/**
 * Convenience wrappers for common toast types
 */

// @ts-expect-error - TypeScript module resolution issue with Node16 and ESM packages
import type { PluginInput } from '@opencode-ai/plugin';

import { sendToast } from './send-toast.js';

/**
 * Send a success toast notification
 */
export const sendSuccessToast = async (
  ctx: PluginInput,
  sessionID: string,
  title: string,
  message: string,
): Promise<void> => {
  await sendToast(ctx, sessionID, { title, message, variant: 'success' });
};

/**
 * Send an error toast notification
 */
export const sendErrorToast = async (
  ctx: PluginInput,
  sessionID: string,
  title: string,
  message: string,
): Promise<void> => {
  await sendToast(ctx, sessionID, { title, message, variant: 'error' });
};

/**
 * Send a warning toast notification
 */
export const sendWarningToast = async (
  ctx: PluginInput,
  sessionID: string,
  title: string,
  message: string,
): Promise<void> => {
  await sendToast(ctx, sessionID, { title, message, variant: 'warning' });
};

/**
 * Send an info toast notification
 */
export const sendInfoToast = async (
  ctx: PluginInput,
  sessionID: string,
  title: string,
  message: string,
): Promise<void> => {
  await sendToast(ctx, sessionID, { title, message, variant: 'info' });
};
