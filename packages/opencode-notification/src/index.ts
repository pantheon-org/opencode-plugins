/**
 * OpenCode Notification Library
 *
 * A shared library of notification utilities for OpenCode plugins.
 * Provides common functionality for toast notifications and session messages.
 */

// Export types
export type {
  Logger,
  MessageOptions,
  NotificationOptions,
  OpenCodeClient,
  PluginContext,
  SoundDescription,
  ToastOptions,
} from './notifier';
// Export notification utilities
export * from './notifier';

// Export the createNotificationUtility function
export { createNotificationUtility, createNotifier } from './notifier';
