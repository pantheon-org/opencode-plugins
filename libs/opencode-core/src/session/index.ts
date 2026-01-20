/**
 * Session barrel module
 * Re-exports all session functionality
 */

export { sendToast } from './send-toast.js';
export { sendProgress } from './send-progress.js';
export { sendSuccessToast, sendErrorToast, sendWarningToast, sendInfoToast } from './toast-helpers.js';
export { getSessionConfig } from './get-session-config.js';
export { formatDuration } from './format-duration.js';
export { formatCount } from './format-count.js';
export { createSummary } from './create-summary.js';

// Re-export types
export type { ToastVariant, ToastConfig, ProgressConfig, SessionConfig } from '../types/session-types.js';
