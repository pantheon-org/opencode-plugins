/**
 * Session type definitions for OpenCode plugins
 */

/**
 * Toast notification variant types
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification configuration
 */
export interface ToastConfig {
  /** Toast title (short, descriptive) */
  title: string;
  /** Toast message (detailed information) */
  message: string;
  /** Visual style of the toast */
  variant: ToastVariant;
  /** Optional duration in milliseconds (defaults to auto) */
  duration?: number;
}

/**
 * Progress message configuration
 */
export interface ProgressConfig {
  /** Progress message text */
  text: string;
  /** Whether this is a status update (vs initial message) */
  isUpdate?: boolean;
}

/**
 * Session configuration for plugins
 */
export interface SessionConfig {
  /** Whether to show toast notifications */
  showToasts?: boolean;
  /** Whether to show progress messages */
  showProgress?: boolean;
  /** Whether to suppress all session integration */
  suppressAll?: boolean;
}
