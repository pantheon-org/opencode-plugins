/**
 * Toast notification variants
 */
export type ToastVariant = 'success' | 'warning' | 'info' | 'error';

/**
 * Toast notification options
 */
export interface ToastOptions {
  title: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

/**
 * Message notification options
 */
export interface MessageOptions {
  text: string;
  sessionID?: string;
  agent?: string;
  model?: string;
  variant?: string;
  noReply?: boolean;
  ignored?: boolean;
}

/**
 * Notification options supporting both toast and message types
 */
export interface NotificationOptions {
  /** Use toast notification (default: false) */
  useToast?: boolean;
  /** Use message notification (default: false) */
  useMessage?: boolean;
  /** Toast-specific options */
  toast?: ToastOptions;
  /** Message-specific options */
  message?: MessageOptions;
}

/**
 * OpenCode client interface for notifications
 */
export interface OpenCodeClient {
  tui: {
    showToast: (options: { body: ToastOptions }) => Promise<any>;
  };
  session: {
    prompt: (options: any) => Promise<any>;
  };
}

/**
 * Sound descriptions for audio notifications (optional enhancement)
 */
export interface SoundDescription {
  /** Display name of the sound */
  name: string;
  /** Sound file path or URL */
  path?: string;
  /** Alternative path if primary not available */
  fallback?: string;
  /** Whether to play sound (default: true) */
  enabled?: boolean;
}

/**
 * Plugin context interface - flexible to accept any context with client property
 */
export interface PluginContext {
  client: OpenCodeClient;
  sessionID?: string;
  agent?: string;
  model?: string;
  variant?: string;
  [key: string]: any; // Allow additional properties from actual SDK types
}

/**
 * Logger interface
 */
export interface Logger {
  info?: (message: string, context?: Record<string, unknown>) => void;
  warn?: (message: string, context?: Record<string, unknown>) => void;
  error?: (message: string, context?: Record<string, unknown>) => void;
  debug?: (message: string, context?: Record<string, unknown>) => void;
}

/**
 * Default toast durations (in milliseconds)
 */
export const TOAST_DURATION = {
  SUCCESS: 3000,
  WARNING: 5000,
  INFO: 4000,
  ERROR: 6000,
} as const;

/**
 * Create a notification utility that supports both toast and message notifications
 *
 * @param ctx - Plugin context containing client
 * @param logger - Optional logger for debugging
 * @returns Notification utility with toast and message methods
 */
export const createNotifier = (ctx: PluginContext, logger?: Logger) => {
  const { client } = ctx;

  /**
   * Send a toast notification
   */
  const showToast = async (options: ToastOptions): Promise<void> => {
    try {
      await client.tui.showToast({
        body: {
          title: options.title,
          message: options.message,
          variant: options.variant,
          duration: options.duration,
        },
      });
    } catch (error) {
      // Silently ignore toast errors - not critical
      if (logger?.debug) {
        logger.debug('Toast notification failed', { error });
      }
    }
  };

  /**
   * Send an ignored message to the chat UI (like DCP plugin)
   */
  const sendIgnoredMessage = async (options: MessageOptions): Promise<void> => {
    try {
      const sessionID = options.sessionID || ctx.sessionID;
      if (!sessionID) {
        if (logger?.warn) {
          logger.warn('No sessionID available for message notification');
        }
        return;
      }

      await client.session.prompt({
        path: { id: sessionID },
        body: {
          noReply: options.noReply ?? true,
          agent: options.agent ?? ctx.agent,
          model: options.model ?? ctx.model,
          variant: options.variant ?? ctx.variant,
          parts: [
            {
              type: 'text',
              text: options.text,
              ignored: options.ignored ?? true,
            },
          ],
        },
      });
    } catch (error) {
      if (logger?.error) {
        logger.error('Failed to send message notification', { error, options });
      }
    }
  };

  /**
   * Send notification supporting both toast and message types
   */
  const notify = async (options: NotificationOptions): Promise<void> => {
    const { useToast = false, useMessage = false, toast, message } = options;

    // Send toast notification if requested
    if (useToast && toast) {
      await showToast(toast);
    }

    // Send message notification if requested
    if (useMessage && message) {
      await sendIgnoredMessage(message);
    }
  };

  /**
   * Convenience method for success notifications
   */
  const success = async (title: string, message: string, useToastOnly: boolean = true): Promise<void> => {
    await notify({
      useToast: useToastOnly,
      useMessage: !useToastOnly,
      toast: {
        title,
        message,
        variant: 'success',
        duration: TOAST_DURATION.SUCCESS,
      },
      message: {
        text: `✅ ${title}: ${message}`,
      },
    });
  };

  /**
   * Convenience method for warning notifications
   */
  const warning = async (title: string, message: string, useToastOnly: boolean = true): Promise<void> => {
    await notify({
      useToast: useToastOnly,
      useMessage: !useToastOnly,
      toast: {
        title,
        message,
        variant: 'warning',
        duration: TOAST_DURATION.WARNING,
      },
      message: {
        text: `⚠️ ${title}: ${message}`,
      },
    });
  };

  /**
   * Convenience method for info notifications
   */
  const info = async (title: string, message: string, useToastOnly: boolean = true): Promise<void> => {
    await notify({
      useToast: useToastOnly,
      useMessage: !useToastOnly,
      toast: {
        title,
        message,
        variant: 'info',
        duration: TOAST_DURATION.INFO,
      },
      message: {
        text: `ℹ️ ${title}: ${message}`,
      },
    });
  };

  /**
   * Convenience method for error notifications
   */
  const error = async (title: string, message: string, useToastOnly: boolean = true): Promise<void> => {
    await notify({
      useToast: useToastOnly,
      useMessage: !useToastOnly,
      toast: {
        title,
        message,
        variant: 'error',
        duration: TOAST_DURATION.ERROR,
      },
      message: {
        text: `❌ ${title}: ${message}`,
      },
    });
  };

  return {
    showToast,
    sendIgnoredMessage,
    notify,
    success,
    warning,
    info,
    error,
  };
};

/**
 * Export types and utilities for easy importing
 */
export type Notifier = ReturnType<typeof createNotifier>;
export { createNotifier as createNotificationUtility };
