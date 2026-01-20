/**
 * Convenience wrappers for common toast types
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - TypeScript 5.3+ requires resolution-mode for ESM type imports in CJS context
import type { PluginInput } from '@opencode-ai/plugin';

import { sendToast } from './send-toast';

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
