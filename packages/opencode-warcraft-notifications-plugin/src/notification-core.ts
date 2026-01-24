/**
 * Notification utilities using opencode-core library
 * This replaces the manual toast implementation with opencode-core
 */

import type { Plugin } from '@opencode-ai/plugin';
import { createNotifier } from '@pantheon-org/opencode-notification';

import type { Logger } from './logger';
import type { soundDescriptions } from './sounds/descriptions';

const TOAST_DURATION = {
  SUCCESS: 3000,
  WARNING: 5000,
  INFO: 4000,
  ERROR: 6000,
} as const;

/**
 * Show toast notification using opencode-core library
 *
 * @param ctx Plugin context
 * @param title Toast title
 * @param message Toast message
 * @param variant Toast variant (success, warning, info, error)
 * @param duration Toast duration in ms (default based on variant)
 * @param logger Optional logger for debugging
 */
export const showToast = async (
  ctx: Plugin,
  {
    title,
    message,
    variant,
    duration,
  }: {
    title: string;
    message: string;
    variant: 'success' | 'warning' | 'info' | 'error';
    duration?: number;
  },
  logger?: Logger,
): Promise<void> => {
  // Create notifier with OpenCode context and logger
  const notify = createNotifier(ctx, logger);

  // Use opencode-core toast functionality with default durations
  await notify.showToast({
    title,
    message,
    variant,
    duration: duration ?? TOAST_DURATION[variant.toUpperCase() as keyof typeof TOAST_DURATION],
  });
};

/**
 * Send message notification using opencode-core library
 *
 * @param ctx Plugin context
 * @param text Message text to send
 * @param options Additional message options
 * @param logger Optional logger for debugging
 */
export const sendMessage = async (
  ctx: Plugin,
  text: string,
  {
    sessionID,
    noReply = true,
    ignored = true,
  }: {
    sessionID?: string;
    noReply?: boolean;
    ignored?: boolean;
  } = {},
  logger?: Logger,
): Promise<void> => {
  // Create notifier with OpenCode context and logger
  const notify = createNotifier(ctx, logger);

  // Use opencode-core message functionality
  await notify.sendIgnoredMessage({
    text,
    sessionID,
    noReply,
    ignored,
  });
};

/**
 * Show success notification (toast + optional message)
 *
 * @param ctx Plugin context
 * @param title Toast title
 * @param message Toast message
 * @param useToastOnly Whether to only show toast (default: true)
 * @param logger Optional logger for debugging
 */
export const showSuccess = async (
  ctx: Plugin,
  title: string,
  message: string,
  useToastOnly: boolean = true,
  logger?: Logger,
): Promise<void> => {
  const notify = createNotifier(ctx, logger);
  await notify.success(title, message, useToastOnly);
};

/**
 * Show error notification (toast + optional message)
 *
 * @param ctx Plugin context
 * @param title Toast title
 * @param message Toast message
 * @param useToastOnly Whether to only show toast (default: true)
 * @param logger Optional logger for debugging
 */
export const showError = async (
  ctx: Plugin,
  title: string,
  message: string,
  useToastOnly: boolean = true,
  logger?: Logger,
): Promise<void> => {
  const notify = createNotifier(ctx, logger);
  await notify.error(title, message, useToastOnly);
};

/**
 * Show warning notification (toast + optional message)
 *
 * @param ctx Plugin context
 * @param title Toast title
 * @param message Toast message
 * @param useToastOnly Whether to only show toast (default: true)
 * @param logger Optional logger for debugging
 */
export const showWarning = async (
  ctx: Plugin,
  title: string,
  message: string,
  useToastOnly: boolean = true,
  logger?: Logger,
): Promise<void> => {
  const notify = createNotifier(ctx, logger);
  await notify.warning(title, message, useToastOnly);
};

/**
 * Show info notification (toast + optional message)
 *
 * @param ctx Plugin context
 * @param title Toast title
 * @param message Toast message
 * @param useToastOnly Whether to only show toast (default: true)
 * @param logger Optional logger for debugging
 */
export const showInfo = async (
  ctx: Plugin,
  title: string,
  message: string,
  useToastOnly: boolean = true,
  logger?: Logger,
): Promise<void> => {
  const notify = createNotifier(ctx, logger);
  await notify.info(title, message, useToastOnly);
};

// Re-export types for convenience
export type { soundDescriptions } from './sounds';
