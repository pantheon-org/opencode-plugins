/**
 * OpenCode Core Library
 *
 * A shared library of utilities and patterns for OpenCode plugins.
 * Provides common functionality like notifications, logging, and more.
 */

// Export notification utilities
export * from './notification';

// Export types
export type {
  ToastOptions,
  MessageOptions,
  NotificationOptions,
  OpenCodeClient,
  PluginContext,
  Logger,
  SoundDescription,
} from './notification';

// Export the createNotificationUtility function
export { createNotifier, createNotificationUtility } from './notification';
