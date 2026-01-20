/**
 * Create a success response
 */

import type { PluginToolResponse } from '../types/response-types.js';

/**
 * Helper function to create a success response
 *
 * @param data - The successful operation result
 * @param metadata - Optional metadata to include (timestamp is added automatically)
 * @returns Structured success response
 *
 * @example
 * ```typescript
 * return success(organizations, {
 *   sessionID: toolCtx.sessionID,
 *   messageID: toolCtx.messageID,
 *   pagination: {
 *     page: 1,
 *     perPage: 20,
 *     total: organizations.length,
 *   }
 * });
 * ```
 */
export const success = <T>(data: T, metadata?: Partial<PluginToolResponse['metadata']>): PluginToolResponse<T> => {
  return {
    success: true,
    data,
    metadata: {
      timestamp: Date.now(),
      ...metadata,
    },
  };
};
