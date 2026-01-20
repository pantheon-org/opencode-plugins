/**
 * Logger type definitions for OpenCode plugins
 */

/**
 * Logger instance with plugin-specific context
 */
export interface PluginLogger {
  /** Log informational messages */
  info: (message: string, metadata?: Record<string, unknown>) => void;
  /** Log warning messages */
  warn: (message: string, metadata?: Record<string, unknown>) => void;
  /** Log error messages */
  error: (message: string, metadata?: Record<string, unknown>) => void;
  /** Log debug messages (only shown in verbose mode) */
  debug: (message: string, metadata?: Record<string, unknown>) => void;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Plugin name (e.g., 'snyk', 'jira', 'gitlab') */
  plugin: string;
  /** Optional tool name for more granular logging */
  tool?: string;
  /** Include console fallback during migration (default: false) */
  consoleFallback?: boolean;
}
