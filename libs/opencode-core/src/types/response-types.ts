/**
 * Response type definitions for OpenCode plugins
 */

/**
 * Standard response format for all OpenCode plugin tools
 *
 * Example:
 * ```typescript
 * // Success response
 * const result: PluginToolResponse<Organization[]> = {
 *   success: true,
 *   data: organizations,
 *   metadata: {
 *     timestamp: Date.now(),
 *     sessionID: 'session-123',
 *   }
 * };
 *
 * // Error response
 * const result: PluginToolResponse = {
 *   success: false,
 *   error: {
 *     message: 'API request failed',
 *     code: 'API_ERROR',
 *   },
 *   metadata: {
 *     timestamp: Date.now(),
 *   }
 * };
 * ```
 */
export interface PluginToolResponse<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean;

  /** Response data (present when success is true) */
  data?: T;

  /** Error information (present when success is false) */
  error?: {
    /** Human-readable error message */
    message: string;
    /** Machine-readable error code (e.g., 'API_ERROR', 'AUTH_REQUIRED') */
    code?: string;
    /** Additional error context for debugging */
    context?: Record<string, unknown>;
  };

  /** Metadata about the operation */
  metadata: {
    /** Session ID from ToolContext */
    sessionID?: string;
    /** Message ID from ToolContext */
    messageID?: string;
    /** Unix timestamp (ms) when operation completed */
    timestamp: number;
    /** Operation duration in milliseconds */
    duration?: number;

    // Service-specific metadata
    /** API rate limit information (if available) */
    rateLimit?: {
      /** Maximum requests allowed */
      limit: number;
      /** Remaining requests in current window */
      remaining: number;
      /** Unix timestamp (seconds) when rate limit resets */
      reset: number;
    };

    /** Pagination information (if applicable) */
    pagination?: {
      /** Current page number */
      page: number;
      /** Results per page */
      perPage: number;
      /** Total number of items (if known) */
      total?: number;
      /** Whether more pages are available */
      hasMore?: boolean;
    };
  };
}
