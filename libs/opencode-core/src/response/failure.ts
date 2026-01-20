/**
 * Create a failure response
 */

import type { PluginToolResponse } from '../types/response-types.js';

/**
 * Helper function to create an error response
 *
 * @param message - Human-readable error message
 * @param options - Optional error details and metadata
 * @returns Structured error response
 *
 * @example
 * ```typescript
 * return failure('API request failed', {
 *   code: 'SNYK_API_ERROR',
 *   context: {
 *     statusCode: 403,
 *     endpoint: '/orgs',
 *     organizationId: args.organizationId,
 *   },
 *   metadata: {
 *     sessionID: toolCtx.sessionID,
 *   }
 * });
 * ```
 */
export const failure = (
  message: string,
  options?: {
    /** Machine-readable error code */
    code?: string;
    /** Additional context for debugging */
    context?: Record<string, unknown>;
    /** Additional metadata */
    metadata?: Partial<PluginToolResponse['metadata']>;
  },
): PluginToolResponse<never> => {
  return {
    success: false,
    error: {
      message,
      code: options?.code,
      context: options?.context,
    },
    metadata: {
      timestamp: Date.now(),
      ...options?.metadata,
    },
  };
};
