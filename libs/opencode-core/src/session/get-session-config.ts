/**
 * Extract session configuration from plugin config
 */

import type { SessionConfig } from '../types/session-types.js';

/**
 * Extract session configuration from OpenCode config
 *
 * Returns default values if configuration is not found.
 *
 * @param config - Full OpenCode configuration object
 * @param pluginName - Name of the plugin (e.g., 'snyk', 'jira', 'gitlab')
 * @returns Session configuration with defaults
 */
export const getSessionConfig = (config: Record<string, unknown>, pluginName: string): SessionConfig => {
  const pluginConfig = config?.[pluginName] as Record<string, unknown> | undefined;
  const notifications = (pluginConfig?.notifications as Record<string, unknown> | undefined) || {};

  return {
    showToasts: notifications.enabled !== false && notifications.success !== false,
    showProgress: notifications.enabled !== false && notifications.progress !== false,
    suppressAll: notifications.enabled === false,
  };
};
