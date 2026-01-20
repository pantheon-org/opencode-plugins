/**
 * Create a logger instance for a plugin or tool
 */

import type { LoggerConfig, PluginLogger } from '../types/logger-types.js';

/**
 * Structured logger implementation for OpenCode plugins
 *
 * Outputs structured JSON logs that OpenCode can parse and display appropriately.
 * Uses stderr for warnings/errors and stdout for info/debug messages.
 */
class StructuredLogger implements PluginLogger {
  constructor(private readonly module: string) {}

  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: Record<string, unknown>): void {
    const logEntry = {
      level,
      module: this.module,
      message,
      timestamp: new Date().toISOString(),
      ...(metadata && { context: metadata }),
    };

    // Output structured JSON to appropriate stream
    const output = JSON.stringify(logEntry);
    if (level === 'error' || level === 'warn') {
      process.stderr.write(output + '\n');
    } else {
      process.stdout.write(output + '\n');
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log('error', message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (process.env.DEBUG_OPENCODE) {
      this.log('debug', message, metadata);
    }
  }
}

/**
 * Create a logger instance for a plugin or tool
 *
 * Creates a structured logger that outputs JSON-formatted logs to stdout/stderr.
 * This allows OpenCode to capture, parse, and display logs appropriately in its UI.
 *
 * - Info/debug logs go to stdout
 * - Warn/error logs go to stderr
 * - All logs include timestamp, level, module name, and optional context
 * - Debug logs only output when DEBUG_OPENCODE environment variable is set
 *
 * @param config - Logger configuration
 * @returns Logger instance with standardized methods
 *
 * @example
 * ```typescript
 * // Plugin-level logger
 * const log = createLogger({ plugin: 'snyk' });
 * log.info('Plugin initialized');
 *
 * // Tool-level logger
 * const log = createLogger({ plugin: 'snyk', tool: 'list-organizations' });
 * log.info('Fetching organizations', { count: 5 });
 *
 * // With console fallback during migration
 * const log = createLogger({ plugin: 'jira', consoleFallback: true });
 * log.warn('Deprecated parameter used', { param: 'apiToken' });
 * ```
 */
export const createLogger = (config: LoggerConfig): PluginLogger => {
  const moduleName = config.tool
    ? `opencode-plugin-${config.plugin}:${config.tool}`
    : `opencode-plugin-${config.plugin}`;

  const structuredLogger = new StructuredLogger(moduleName);

  // If console fallback is requested, wrap the logger
  if (config.consoleFallback) {
    return {
      info: (message: string, metadata?: Record<string, unknown>) => {
        structuredLogger.info(message, metadata);
        console.info(`[${moduleName}]`, message, metadata || '');
      },
      warn: (message: string, metadata?: Record<string, unknown>) => {
        structuredLogger.warn(message, metadata);
        console.warn(`[${moduleName}]`, message, metadata || '');
      },
      error: (message: string, metadata?: Record<string, unknown>) => {
        structuredLogger.error(message, metadata);
        console.error(`[${moduleName}]`, message, metadata || '');
      },
      debug: (message: string, metadata?: Record<string, unknown>) => {
        structuredLogger.debug(message, metadata);
        if (process.env.DEBUG_OPENCODE) {
          console.debug(`[${moduleName}]`, message, metadata || '');
        }
      },
    };
  }

  return structuredLogger;
};
